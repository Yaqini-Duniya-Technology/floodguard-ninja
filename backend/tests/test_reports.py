import os
import tempfile
from fastapi.testclient import TestClient
from app import main

def test_create_report_and_health():
    with tempfile.TemporaryDirectory() as directory:
        main.DB_PATH = __import__("pathlib").Path(directory) / "test.sqlite3"
        client = TestClient(main.app)
        assert client.get("/health").status_code == 200
        response = client.post("/api/v1/reports", json={"type":"rising-water", "severity":"high", "location":"Lokoja", "description":"Road flooded"})
        assert response.status_code == 201
        assert response.json()["status"] == "PENDING"
        assert client.get("/api/v1/reports").status_code == 405
        assert client.post("/api/v1/reports", json={"type":"", "severity":"high", "location":"L"}).status_code == 422
