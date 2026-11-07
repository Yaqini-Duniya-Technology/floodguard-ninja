"""Internal demonstration metrics only; no real emergency response measurements."""
from datetime import datetime, timezone
from fastapi import APIRouter, Request
from . import main
from .incidents import init as init_incidents, operator_guard

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/operational-summary")
def operational_summary(request: Request):
    operator_guard(request)
    with main.connection() as db:
        init_incidents(db)
        total = db.execute("SELECT COUNT(*) AS n FROM reports").fetchone()["n"]
        counts = db.execute("SELECT status, COUNT(*) AS n FROM reports GROUP BY status").fetchall()
        event_count = db.execute("SELECT COUNT(*) AS n FROM incident_events").fetchone()["n"]
        first_changes = db.execute("""
            SELECT r.timestamp AS created_at, MIN(e.occurred_at) AS first_change_at
            FROM reports r JOIN incident_events e ON e.report_id = r.id
            GROUP BY r.id, r.timestamp
        """).fetchall()
    durations = []
    for row in first_changes:
        try:
            created = datetime.fromisoformat(row["created_at"].replace("Z","+00:00"))
            changed = datetime.fromisoformat(row["first_change_at"].replace("Z","+00:00"))
            if created.tzinfo is None or changed.tzinfo is None:
                continue
            seconds = (changed - created).total_seconds()
            if seconds >= 0:
                durations.append(seconds)
        except (ValueError, TypeError):
            continue
    return {
        "mode": "demo_only",
        "dispatch": "not_connected",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "reports_received": total,
        "reports_by_internal_status": {row["status"]: row["n"] for row in counts},
        "simulated_status_changes": event_count,
        "first_internal_change_seconds_average": round(sum(durations)/len(durations), 1) if durations else None,
        "first_internal_change_sample_size": len(durations),
        "real_responder_response_time_seconds": None,
        "confirmed_rescues": None,
        "warnings_delivered": None,
        "limitations": "Internal database counts and demo transitions only; not validated emergency-service outcomes or delivery analytics.",
    }
