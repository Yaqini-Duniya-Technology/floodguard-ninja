"""Receipt rotation and best-effort lookup throttling for the prototype.

Receipt tokens are bearer credentials. Rotation invalidates the old token atomically.
A production deployment still requires an edge limiter and durable storage.
"""
import hashlib
import re
import secrets
import time
from collections import defaultdict, deque
from threading import Lock
from fastapi import APIRouter, HTTPException, Request
from . import main

router = APIRouter(prefix="/api/v1/reports", tags=["receipt-security"])
_lock = Lock()
_attempts = defaultdict(deque)

def throttle(request: Request):
    host = request.client.host if request.client else "unknown"
    now = time.monotonic()
    with _lock:
        hits = _attempts[host]
        while hits and hits[0] < now - 60:
            hits.popleft()
        if len(hits) >= 30:
            raise HTTPException(429, "Too many receipt checks; try again later")
        hits.append(now)

def authenticated_report(report_id: str, request: Request):
    throttle(request)
    token = request.headers.get("X-Report-Receipt", "")
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id) or not 1 <= len(token) <= 128:
        raise HTTPException(404, "Report not found")
    with main.connection() as db:
        row = db.execute("SELECT token_hash FROM report_receipts WHERE report_id=?", (report_id,)).fetchone()
    hashed = hashlib.sha256(token.encode()).hexdigest()
    if not row or not secrets.compare_digest(row["token_hash"], hashed):
        raise HTTPException(404, "Report not found")
    return hashed

@router.post("/{report_id}/rotate-receipt")
def rotate_receipt(report_id: str, request: Request):
    old_hash = authenticated_report(report_id, request)
    new_token = secrets.token_urlsafe(32)
    new_hash = hashlib.sha256(new_token.encode()).hexdigest()
    with main.connection() as db:
        updated = db.execute(
            "UPDATE report_receipts SET token_hash=? WHERE report_id=? AND token_hash=?",
            (new_hash, report_id, old_hash),
        )
        if updated.rowcount != 1:
            raise HTTPException(409, "Receipt was already rotated")
    return {"report_id": report_id, "receipt_token": new_token, "previous_receipt_revoked": True,
            "notice": "Save this new token securely. The old receipt no longer works."}
