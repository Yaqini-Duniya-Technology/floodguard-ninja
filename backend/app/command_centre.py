"""Restricted command-centre demonstration. No real agency connection or dispatch."""
from datetime import datetime, timezone
from fastapi import APIRouter, Query, Request
from . import main
from .incidents import operator_guard, init as init_incidents
from .community import init as init_community

router = APIRouter(prefix="/api/v1/command-centre", tags=["command-centre"])

@router.get("/overview")
def overview(request: Request, limit: int = Query(default=30, ge=1, le=100)):
    # Never expose incident locations or citizen descriptions publicly.
    operator_guard(request)
    with main.connection() as db:
        init_incidents(db)
        init_community(db)
        rows = db.execute("""SELECT r.id, r.status, r.severity, r.type, r.timestamp,
                COALESCE(cr.decision,'UNVERIFIED') AS review_status,
                (SELECT MAX(occurred_at) FROM incident_events ie WHERE ie.report_id=r.id) AS last_transition_at
                FROM reports r LEFT JOIN community_reviews cr ON cr.report_id=r.id
                ORDER BY r.timestamp DESC LIMIT ?""", (limit,)).fetchall()
        totals = db.execute("SELECT status, COUNT(*) AS count FROM reports GROUP BY status").fetchall()
    return {
        "mode": "demo_only",
        "dispatch": "not_connected",
        "agency_authenticated": False,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "totals": {row["status"]: row["count"] for row in totals},
        "incidents": [dict(row) for row in rows],
        "limitations": "Simulated workflow only. No emergency service acknowledgement, responder assignment or actual rescue is confirmed.",
    }
