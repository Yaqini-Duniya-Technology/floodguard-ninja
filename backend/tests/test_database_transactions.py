"""Verify idempotency and atomic report creation using isolated SQLite databases."""
import sqlite3
import uuid

import pytest
from fastapi.testclient import TestClient

from app import main
from app.database import initialize_schema


@pytest.fixture
def isolated_db(tmp_path, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("FLOODGUARD_ENV", raising=False)
    path = tmp_path / "transaction-test.sqlite3"
    monkeypatch.setattr(main, "DB_PATH", path)
    with sqlite3.connect(path) as db:
        initialize_schema(db)
    return path


def sample_report():
    return {
        "type": "rising-water",
        "severity": "high",
        "location": "Lokoja",
        "description": "Floodwater covering the road",
    }


def test_duplicate_idempotency_key_rejected(isolated_db):
    key = "floodguard-" + uuid.uuid4().hex
    headers = {"Idempotency-Key": key}
    with TestClient(main.app) as client:
        first = client.post("/api/v1/reports", json=sample_report(), headers=headers)
        second = client.post("/api/v1/reports", json=sample_report(), headers=headers)
    assert first.status_code == 201, first.text
    assert second.status_code == 409, second.text
    with sqlite3.connect(isolated_db) as db:
        assert db.execute("SELECT COUNT(*) FROM reports").fetchone()[0] == 1


def test_failed_receipt_insert_rolls_back_report(isolated_db):
    with sqlite3.connect(isolated_db) as db:
        db.execute("""
            CREATE TRIGGER reject_receipt
            BEFORE INSERT ON report_receipts
            BEGIN
                SELECT RAISE(ABORT, 'Receipt insertion blocked');
            END
        """)
    with TestClient(main.app) as client:
        try:
            response = client.post("/api/v1/reports", json=sample_report())
        except sqlite3.IntegrityError:
            pass
        else:
            assert response.status_code >= 400, (
                "A failed receipt insertion must not succeed"
            )
    with sqlite3.connect(isolated_db) as db:
        assert db.execute("SELECT COUNT(*) FROM reports").fetchone()[0] == 0
