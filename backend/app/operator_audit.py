"""Demo-only, redacted operator audit trail. No citizen location or notes returned."""
import re
from fastapi import APIRouter, HTTPException, Query, Request
from . import main
from .incidents import operator_guard, init as init_incidents
from .community import init as init_community

router = APIRouter(prefix="/api/v1/operator", tags=["operator-demo"])

@router.get("/audit")
def audit(request: Request, limit: int = Query(default=50, ge=1, le=100)):
    operator_guard(request)
    with main.connection() as db:
        init_incidents(db)
        init_community(db)
        events = db.execute("""
            SELECT report_id, 'status_transition' AS kind, previous_status AS old_value,
                   new_status AS new_value, occurred_at FROM incident_events
            UNION ALL
            SELECT report_id, 'community_review' AS kind, NULL AS old_value,
                   decision AS new_value, occurred_at FROM community_review_events
            ORDER BY occurred_at DESC LIMIT ?
        """, (limit,)).fetchall()
    return {"mode": "demo_only", "events": [dict(row) for row in events],
            "excluded_fields": ["location", "description", "note", "receipt_token", "token_hash"]}

@router.get("/reports/{report_id}/history")
def history(report_id: str, request: Request):
    operator_guard(request)
    if not re.fullmatch(r"[0-9a-f-]{36}", report_id):
        raise HTTPException(404, "Report not found")
    with main.connection() as db:
        init_incidents(db)
        init_community(db)
        if not db.execute("SELECT 1 FROM reports WHERE id=?", (report_id,)).fetchone():
            raise HTTPException(404, "Report not found")
        status = db.execute("SELECT previous_status, new_status, occurred_at FROM incident_events WHERE report_id=? ORDER BY id", (report_id,)).fetchall()
        reviews = db.execute("SELECT decision, occurred_at FROM community_review_events WHERE report_id=? ORDER BY id", (report_id,)).fetchall()
    return {"report_id": report_id, "transitions": [dict(x) for x in status],
            "reviews": [dict(x) for x in reviews], "mode": "demo_only"}
