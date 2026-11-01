"""Operator-only receipt revocation. Never expose this as a public API route.

Run from backend: python -m app.revoke_receipt --report-id UUID --reason TEXT --confirm
Requires direct database access; production requires DATABASE_URL.
"""
import argparse
import hashlib
import json
import secrets
import sys
import uuid
from datetime import datetime, timezone
from .database import database_engine, open_database, initialize_schema


def revoke(report_id: str, reason: str, *, confirm: bool = False, sqlite_path=None):
    if not confirm:
        raise ValueError("Explicit --confirm is required")
    try:
        report_id = str(uuid.UUID(report_id))
    except (ValueError, AttributeError) as exc:
        raise ValueError("Invalid report ID") from exc
    if not reason.strip() or len(reason) > 300:
        raise ValueError("A reason of 1–300 characters is required")
    engine = database_engine()
    with open_database(sqlite_path) as conn:
        if engine == "sqlite":
            initialize_schema(conn)
        param = "%s" if engine == "postgresql" else "?"
        # Rotate to an unrecoverable random value, invalidating the old receipt.
        # The replacement token is intentionally never returned or logged.
        new_hash = hashlib.sha256(secrets.token_bytes(32)).hexdigest()
        cursor = conn.execute(
            f"UPDATE report_receipts SET token_hash={param} WHERE report_id={param}",
            (new_hash, report_id),
        )
        if cursor.rowcount != 1:
            raise LookupError("Receipt not found; no changes made")
        # Commit and audit in the same transaction.
        audit_id = str(uuid.uuid4())
        at = datetime.now(timezone.utc).isoformat()
        conn.execute(
            f"INSERT INTO receipt_revocation_audit (id,report_id,revoked_at,reason) VALUES ({param},{param},{param},{param})",
            (audit_id, report_id, at, reason.strip()),
        )
        if engine == "postgresql":
            conn.commit()
    return {"report_id": report_id, "revoked_at": at, "audit_id": audit_id}


def main():
    parser = argparse.ArgumentParser(description="Revoke a report receipt via privileged database connection")
    parser.add_argument("--report-id", required=True)
    parser.add_argument("--reason", required=True)
    parser.add_argument("--confirm", action="store_true")
    args = parser.parse_args()
    try:
        print(json.dumps(revoke(args.report_id, args.reason, confirm=args.confirm)))
    except (ValueError, LookupError, RuntimeError) as exc:
        print(f"Revocation failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
