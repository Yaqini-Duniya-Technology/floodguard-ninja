"""Auditable, explicitly non-dispatch incident lifecycle.

Operator updates are restricted to non-production demonstration environments.
A shared demo operator secret is NOT a production authentication system.
"""
import os
import re
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from . import main

router = APIRouter(prefix="/api/v1/incidents", tags=["incidents"])
STATES = ("PENDING", "ACKNOWLEDGED", "ASSIGNED", "RESPONDING", "RESOLVED", "ESCALATED", "CANCELLED")
ALLOWED = {
    "PENDING": {"ACKNOWLEDGED", "ESCALATED", "CANCELLED"},
    "ACKNOWLEDGED": {"ASSIGNED", "ESCALATED", "CANCELLED"},
    "ASSIGNED": {"RESPONDING", "ESCALATED", "CANCELLED"},
    "RESPONDING": {"RESOLVED", "ESCALATED"},
    "ESCALATED": {"ACKNOWLEDGED", "ASSIGNED", "CANCELLED"},
    "RESOLVED": set(), "CANCELLED": set(),
}
class Transition(BaseModel):
    status: str
    note: str = Field(default="", max_length=500)

def init(db):
    db.execute("""CREATE TABLE IF NOT EXISTS incident_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        previous_status TEXT NOT NULL,
        new_status TEXT NOT NULL,
        note TEXT NOT NULL,
        actor TEXT NOT NULL,
        occurred_at TEXT NOT NULL
    )""")
    db.execute("CREATE INDEX IF NOT EXISTS idx_incident_events_report ON incident_events(report_id, id)")

def operator_guard(request: Request):
    if os.getenv("FLOODGUARD_ENV") == "production":
        raise HTTPException(503, "Operator workflow not enabled in production")
    configured = os.getenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", "")
    provided = request.headers.get("X-Demo-Operator-Token", "")
    if len(configured) < 24 or not secrets.compare_digest(configured, provided):
        raise HTTPException(403, "Demo operator access denied")

@router.post("/{report_id}/transitions")
def transition(report_id: str, payload: Transition, request: Request):
    operator_guard(request)
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id):
        raise HTTPException(404, "Incident not found")
    if payload.status not in STATES:
        raise HTTPException(422, "Unsupported status")
    with main.connection() as db:
        init(db)
        row = db.execute("SELECT status FROM reports WHERE id=?", (report_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Incident not found")
        previous = row["status"]
        if payload.status not in ALLOWED.get(previous, set()):
            raise HTTPException(409, "Invalid incident state transition")
        db.execute("UPDATE reports SET status=? WHERE id=? AND status=?", (payload.status, report_id, previous))
        db.execute("INSERT INTO incident_events (report_id, previous_status, new_status, note, actor, occurred_at) VALUES (?,?,?,?,?,?)",
                   (report_id, previous, payload.status, payload.note.strip(), "demo_operator", datetime.now(timezone.utc).isoformat()))
    return {"id": report_id, "previous_status": previous, "status": payload.status, "dispatch": "not_connected", "simulation": True}

@router.get("/{report_id}/timeline")
def timeline(report_id: str, request: Request):
    receipt = request.headers.get("X-Report-Receipt", "")
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id) or len(receipt) > 128:
        raise HTTPException(404, "Incident not found")
    with main.connection() as db:
        init(db)
        row = db.execute("SELECT token_hash FROM report_receipts WHERE report_id=?", (report_id,)).fetchone()
        if not row or not secrets.compare_digest(row["token_hash"], __import__("hashlib").sha256(receipt.encode()).hexdigest()):
            raise HTTPException(404, "Incident not found")
        events = db.execute("SELECT previous_status, new_status, occurred_at FROM incident_events WHERE report_id=? ORDER BY id", (report_id,)).fetchall()
    return {"id": report_id, "events": [dict(event) for event in events], "dispatch": "not_connected", "simulation": True}
