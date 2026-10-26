from contextlib import closing
"""FloodGuard report intake. Not connected to emergency dispatch."""
import os
import sqlite3
import uuid
import re
import secrets
import hashlib
from contextlib import contextmanager
from datetime import datetime, timezone
import time
from collections import defaultdict, deque
from threading import Lock
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from .postcode import router as postcode_router
from .geospatial import router as geospatial_router
from .intelligence import router as intelligence_router
from .overview import router as overview_router

DB_PATH = Path(os.environ.get("FLOODGUARD_DB_PATH", str(Path(__file__).resolve().parents[1] / "floodguard.sqlite3")))
app = FastAPI(title="FloodGuard API", version="2.6.0", docs_url=None if os.getenv("FLOODGUARD_ENV") == "production" else "/docs", redoc_url=None if os.getenv("FLOODGUARD_ENV") == "production" else "/redoc")
_rate_hits = defaultdict(deque)
_rate_lock = Lock()
origins = [x.strip() for x in os.environ.get("FLOODGUARD_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["Content-Type", "Idempotency-Key", "X-Request-ID", "X-Report-Receipt"])

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # Reject oversized declared payloads before parsing JSON.
    if request.method in ("POST", "PUT", "PATCH"):
        try:
            size = int(request.headers.get("content-length", "0"))
        except ValueError:
            return _json_error(400, "Invalid Content-Length")
        if size > 16_384:
            return _json_error(413, "Request body too large")
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Request-ID"] = request.headers.get("X-Request-ID", "")[:64] if re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", request.headers.get("X-Request-ID", "")) else uuid.uuid4().hex
    return response

def _json_error(status: int, detail: str):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=status, content={"detail": detail})

@contextmanager
def connection():
    if os.getenv("FLOODGUARD_ENV") == "production" and not os.getenv("FLOODGUARD_DB_PATH"):
        raise RuntimeError("Production requires FLOODGUARD_DB_PATH on durable storage")
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(DB_PATH, timeout=10)) as connection:
        with connection as db:
            db.row_factory = sqlite3.Row
            db.execute("PRAGMA busy_timeout=10000")
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("""CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY, type TEXT NOT NULL, severity TEXT NOT NULL,
                location TEXT NOT NULL, description TEXT NOT NULL,
                timestamp TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING')""")
            db.execute("CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp)")
            db.execute("""CREATE TABLE IF NOT EXISTS report_receipts (
                report_id TEXT PRIMARY KEY, token_hash TEXT NOT NULL,
                FOREIGN KEY(report_id) REFERENCES reports(id))""")
            db.execute("""CREATE TABLE IF NOT EXISTS report_idempotency (
                key_hash TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, report_id TEXT NOT NULL)""")
            yield db

class ReportIn(BaseModel):
    type: str = Field(min_length=1, max_length=80)
    severity: str = Field(min_length=1, max_length=30)
    location: str = Field(min_length=2, max_length=240)
    description: str = Field(default="", max_length=3000)
    postcode: str | None = Field(default=None, max_length=40)

    @field_validator("type", "severity", "location", "description")
    @classmethod
    def clean_text(cls, value: str) -> str:
        value = value.strip()
        if any(ord(ch) < 32 and ch not in "\n\t" for ch in value):
            raise ValueError("Control characters are not permitted")
        return value

    @field_validator("postcode")
    @classmethod
    def clean_postcode(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        normalized = re.sub(r"[- ]", "", value.strip().upper())
        if not re.fullmatch(r"[A-Z0-9]{11}", normalized):
            raise ValueError("Postcode must contain 11 letters/digits (format check only)")
        return normalized

class ReportOut(ReportIn):
    id: str
    timestamp: str
    status: str
    receipt_token: str | None = None  # Returned only once on creation, not stored in plaintext.

@app.get("/health")
def health():
    return {"status": "ok", "service": "floodguard-api", "version": "2.6.0"}

@app.post("/api/v1/reports", response_model=ReportOut, status_code=201)
def create_report(payload: ReportIn, request: Request):
    # Per-process best-effort abuse throttle; deploy an edge rate limiter for production.
    client = request.client.host if request.client else "unknown"
    now = time.monotonic()
    with _rate_lock:
        hits = _rate_hits[client]
        while hits and hits[0] < now - 60:
            hits.popleft()
        if len(hits) >= 10:
            raise HTTPException(status_code=429, detail="Too many reports; retry later.")
        hits.append(now)
    import json
    payload_hash = hashlib.sha256(json.dumps(payload.model_dump(), sort_keys=True).encode()).hexdigest()
    idempotency = request.headers.get("Idempotency-Key", "")
    if idempotency and not re.fullmatch(r"[a-zA-Z0-9_-]{8,128}", idempotency):
        raise HTTPException(400, "Invalid Idempotency-Key")
    key_hash = hashlib.sha256(idempotency.encode()).hexdigest() if idempotency else None
    if key_hash:
        with connection() as db:
            existing = db.execute("SELECT payload_hash, report_id FROM report_idempotency WHERE key_hash=?", (key_hash,)).fetchone()
            if existing:
                if existing["payload_hash"] != payload_hash:
                    raise HTTPException(409, "Idempotency key reused with different report")
                raise HTTPException(409, "Report already submitted; use the receipt from the original response")
    receipt_token = secrets.token_urlsafe(32)
    record = ReportOut(**payload.model_dump(), id=str(uuid.uuid4()), timestamp=datetime.now(timezone.utc).isoformat(), status="PENDING", receipt_token=receipt_token)
    with connection() as db:
        db.execute("INSERT INTO reports (id,type,severity,location,description,timestamp,status) VALUES (?,?,?,?,?,?,?)", (record.id, record.type, record.severity, record.location, record.description, record.timestamp, record.status))
        db.execute("INSERT INTO report_receipts (report_id, token_hash) VALUES (?,?)", (record.id, hashlib.sha256(receipt_token.encode()).hexdigest()))
        if key_hash:
            try:
                db.execute("INSERT INTO report_idempotency VALUES (?,?,?)", (key_hash, payload_hash, record.id))
            except sqlite3.IntegrityError:
                raise HTTPException(409, "Report submission already processed")
        # The optional postcode is unverified and is never treated as verified geolocation.
        db.execute("CREATE TABLE IF NOT EXISTS report_postcodes (report_id TEXT PRIMARY KEY, postcode TEXT, verification_status TEXT NOT NULL)")
        if record.postcode:
            db.execute("INSERT INTO report_postcodes VALUES (?,?,?)", (record.id, record.postcode.strip().upper(), "UNVERIFIED"))
    return record

@app.get("/api/v1/reports/{report_id}/status")
def report_receipt_status(report_id: str, request: Request):
    token = request.headers.get("X-Report-Receipt", "")
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id) or len(token) > 128:
        raise HTTPException(404, "Report not found")
    with connection() as db:
        row = db.execute("SELECT r.id, r.status, r.timestamp, x.token_hash FROM reports r JOIN report_receipts x ON r.id=x.report_id WHERE r.id=?", (report_id,)).fetchone()
    if not row or not secrets.compare_digest(row["token_hash"], hashlib.sha256(token.encode()).hexdigest()):
        raise HTTPException(404, "Report not found")
    return {"id": row["id"], "status": row["status"], "submitted_at": row["timestamp"], "dispatch": "not_connected"}

# Public listing intentionally excluded: reports may contain sensitive location details.
# Future admin access requires authentication, authorization and auditing.

app.include_router(postcode_router)

app.include_router(geospatial_router)

app.include_router(intelligence_router)

app.include_router(overview_router)

from .readiness import router as readiness_router
app.include_router(readiness_router)

@app.get("/api/v1/status")
def service_status():
    return {"api": "available", "reporting": "database-backed", "dispatch": "not_connected", "postcode_lookup": "not_verified", "flood_prediction": "not_validated"}
