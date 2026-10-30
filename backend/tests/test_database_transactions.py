from contextlib import closing
import sqlite3
import tempfile
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

from app import main


def sample_report():
    return {
        "type": "rising-water",
        "severity": "high",
        "location": "Lokoja",
        "description": "Floodwater covering the road",
    }


def test_duplicate_idempotency_key_rejected():
    original_path = main.DB_PATH

    try:
        with tempfile.TemporaryDirectory() as directory:
            main.DB_PATH = Path(directory) / "duplicate-test.sqlite3"

            with TestClient(main.app) as client:
                key = "floodguard-" + uuid.uuid4().hex
                headers = {"Idempotency-Key": key}

                first = client.post(
                    "/api/v1/reports",
                    json=sample_report(),
                    headers=headers,
                )

                second = client.post(
                    "/api/v1/reports",
                    json=sample_report(),
                    headers=headers,
                )

                assert first.status_code == 201
                assert second.status_code == 409

            with closing(sqlite3.connect(main.DB_PATH)) as db:
                count = db.execute(
                    "SELECT COUNT(*) FROM reports"
                ).fetchone()[0]

                assert count == 1
    finally:
        main.DB_PATH = original_path


def test_failed_receipt_insert_rolls_back_report():
    original_path = main.DB_PATH

    try:
        with tempfile.TemporaryDirectory() as directory:
            main.DB_PATH = Path(directory) / "rollback-test.sqlite3"

            # Create the database tables.
            with main.connection():
                pass

            # Force receipt insertion to fail.
            with closing(sqlite3.connect(main.DB_PATH)) as db:
                db.execute("""
                    CREATE TRIGGER reject_receipt
                    BEFORE INSERT ON report_receipts
                    BEGIN
                        SELECT RAISE(ABORT, 'Receipt insertion blocked');
                    END
                """)

            with TestClient(main.app) as client:
                try:
                    response = client.post(
                        "/api/v1/reports",
                        json=sample_report(),
                    )
                except sqlite3.IntegrityError:
                    pass
                else:
                    assert response.status_code >= 400, (
                        "A failed receipt insertion must not succeed"
                    )

            with closing(sqlite3.connect(main.DB_PATH)) as db:
                count = db.execute(
                    "SELECT COUNT(*) FROM reports"
                ).fetchone()[0]

                assert count == 0
    finally:
        main.DB_PATH = original_path
