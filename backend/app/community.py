"""Community report review, without publishing identifiable citizen reports."""
import hashlib
import re
import secrets
from datetime import datetime, timezone
from typing import Literal
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from . import main
from .incidents import operator_guard

router = APIRouter(prefix="/api/v1/community", tags=["community"])

class ReviewIn(BaseModel):
    decision: Literal["UNVERIFIED", "NEEDS_MORE_EVIDENCE", "REVIEWED", "REJECTED"]
    note: str = Field(default="", max_length=500)

def init(db):
    db.execute("""CREATE TABLE IF NOT EXISTS community_reviews (
        report_id TEXT PRIMARY KEY,
        decision TEXT NOT NULL DEFAULT 'UNVERIFIED',
        updated_at TEXT,
        FOREIGN KEY(report_id) REFERENCES reports(id)
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS community_review_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        note TEXT NOT NULL,
        occurred_at TEXT NOT NULL
    )""")

@router.get("/{report_id}/review")
def get_review(report_id: str, request: Request):
    token = request.headers.get("X-Report-Receipt", "")
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id) or len(token) > 128:
        raise HTTPException(404, "Report not found")
    with main.connection() as db:
        init(db)
        row = db.execute("SELECT token_hash FROM report_receipts WHERE report_id=?", (report_id,)).fetchone()
        if not row or not secrets.compare_digest(row["token_hash"], hashlib.sha256(token.encode()).hexdigest()):
            raise HTTPException(404, "Report not found")
        review = db.execute("SELECT decision, updated_at FROM community_reviews WHERE report_id=?", (report_id,)).fetchone()
    return {"report_id": report_id, "review_status": review["decision"] if review else "UNVERIFIED",
            "reviewed_at": review["updated_at"] if review else None,
            "official_warning": False, "publicly_verified": False,
            "disclaimer": "Internal review status only. This is not an official flood warning or independent field verification."}

@router.post("/{report_id}/review")
def update_review(report_id: str, payload: ReviewIn, request: Request):
    operator_guard(request)
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id):
        raise HTTPException(404, "Report not found")
    with main.connection() as db:
        init(db)
        if not db.execute("SELECT 1 FROM reports WHERE id=?", (report_id,)).fetchone():
            raise HTTPException(404, "Report not found")
        now = datetime.now(timezone.utc).isoformat()
        db.execute("""INSERT INTO community_reviews (report_id,decision,updated_at) VALUES (?,?,?)
            ON CONFLICT(report_id) DO UPDATE SET decision=excluded.decision, updated_at=excluded.updated_at""",
            (report_id,payload.decision,now))
        db.execute("INSERT INTO community_review_events (report_id,decision,note,occurred_at) VALUES (?,?,?,?)",
                   (report_id,payload.decision,payload.note.strip(),now))
    return {"report_id":report_id,"review_status":payload.decision,"reviewed_at":now,
            "simulation":True,"official_warning":False,"publicly_verified":False}
