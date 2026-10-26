import os
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient
from app import main


def test_create_report_and_health():
    original_db_path = main.DB_PATH

    try:
        with tempfile.TemporaryDirectory() as directory:
            main.DB_PATH = Path(directory) / "test.sqlite3"

            with TestClient(main.app) as client:
                assert client.get("/health").status_code == 200

                response = client.post(
                    "/api/v1/reports",
                    json={
                        "type": "rising-water",
                        "severity": "high",
                        "location": "Lokoja",
                        "description": "Road flooded",
                    },
                )

                assert response.status_code == 201
                assert response.json()["status"] == "PENDING"

                assert client.get("/api/v1/reports").status_code == 405

                assert client.post(
                    "/api/v1/reports",
                    json={
                        "type": "",
                        "severity": "high",
                        "location": "L",
                    },
                ).status_code == 422
    finally:
        main.DB_PATH = original_db_path
