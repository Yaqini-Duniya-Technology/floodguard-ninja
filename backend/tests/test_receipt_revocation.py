"""Receipt revocation tests; never touch production PostgreSQL."""
import hashlib
import sqlite3
import uuid

import pytest

from app.database import initialize_schema
from app.revoke_receipt import revoke


@pytest.fixture
def local_db(tmp_path, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("FLOODGUARD_ENV", raising=False)
    path = tmp_path / "receipts.sqlite3"
    report_id = str(uuid.uuid4())
    token = "test-receipt-token"
    with sqlite3.connect(path) as conn:
        initialize_schema(conn)
        conn.execute(
            "INSERT INTO reports (id,type,severity,location,description,timestamp,status) VALUES (?,?,?,?,?,?,?)",
            (report_id, "TEST", "LOW", "SYNTHETIC", "", "2026-11-01T00:00:00Z", "PENDING"),
        )
        conn.execute(
            "INSERT INTO report_receipts (report_id,token_hash) VALUES (?,?)",
            (report_id, hashlib.sha256(token.encode()).hexdigest()),
        )
    return path, report_id, token


def test_requires_explicit_confirmation(local_db):
    path, report_id, token = local_db
    with pytest.raises(ValueError, match="confirm"):
        revoke(report_id, "Safety test", sqlite_path=path)
    with sqlite3.connect(path) as conn:
        stored = conn.execute("SELECT token_hash FROM report_receipts").fetchone()[0]
    assert stored == hashlib.sha256(token.encode()).hexdigest()


@pytest.mark.parametrize("bad_id", ["invalid", "", "00000000-0000-0000-0000-000000000000"])
def test_invalid_or_unknown_report(local_db, bad_id):
    path, _, _ = local_db
    with pytest.raises((ValueError, LookupError)):
        revoke(bad_id, "Safety test", confirm=True, sqlite_path=path)


def test_requires_reason(local_db):
    path, report_id, _ = local_db
    with pytest.raises(ValueError, match="reason"):
        revoke(report_id, "   ", confirm=True, sqlite_path=path)


def test_revoke_invalidates_receipt_and_audits(local_db):
    path, report_id, token = local_db
    result = revoke(report_id, "Exposed test token", confirm=True, sqlite_path=path)
    assert result["report_id"] == report_id
    assert result["audit_id"]
    with sqlite3.connect(path) as conn:
        stored = conn.execute(
            "SELECT token_hash FROM report_receipts WHERE report_id=?", (report_id,)
        ).fetchone()[0]
        audit = conn.execute(
            "SELECT report_id,reason,revoked_at FROM receipt_revocation_audit WHERE report_id=?",
            (report_id,),
        ).fetchone()
    assert stored != hashlib.sha256(token.encode()).hexdigest()
    assert audit == (report_id, "Exposed test token", result["revoked_at"])


def test_audit_failure_rolls_back_receipt_rotation(local_db):
    path, report_id, token = local_db
    with sqlite3.connect(path) as conn:
        conn.execute("DROP TABLE receipt_revocation_audit")
    with pytest.raises(sqlite3.OperationalError):
        revoke(report_id, "Audit unavailable", confirm=True, sqlite_path=path)
    with sqlite3.connect(path) as conn:
        stored = conn.execute(
            "SELECT token_hash FROM report_receipts WHERE report_id=?", (report_id,)
        ).fetchone()[0]
    assert stored == hashlib.sha256(token.encode()).hexdigest()
