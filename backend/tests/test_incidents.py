import hashlib
import os
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient
from app import main

def test_demo_transitions_and_private_timeline(monkeypatch):
    with tempfile.TemporaryDirectory() as folder:
        monkeypatch.setattr(main, "DB_PATH", Path(folder) / "incident.sqlite3")
        monkeypatch.setenv("FLOODGUARD_ENV", "test")
        monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", "demo-operator-secret-very-long-123")
        client = TestClient(main.app)
        created = client.post("/api/v1/reports", json={"type":"rising-water","severity":"high","location":"Lokoja","description":"Test incident"})
        assert created.status_code == 201
        body = created.json()
        ref = body["id"]
        url = f"/api/v1/incidents/{ref}/transitions"
        assert client.post(url, json={"status":"ACKNOWLEDGED"}).status_code == 403
        headers = {"X-Demo-Operator-Token":"demo-operator-secret-very-long-123"}
        assert client.post(url, json={"status":"RESOLVED"}, headers=headers).status_code == 409
        result = client.post(url, json={"status":"ACKNOWLEDGED","note":"demo"}, headers=headers)
        assert result.status_code == 200
        assert result.json()["dispatch"] == "not_connected"
        assert client.get(f"/api/v1/incidents/{ref}/timeline").status_code == 404
        timeline = client.get(f"/api/v1/incidents/{ref}/timeline",headers={"X-Report-Receipt":body["receipt_token"]})
        assert timeline.status_code == 200
        assert len(timeline.json()["events"]) == 1
        assert client.get(f"/api/v1/reports/{ref}/status",headers={"X-Report-Receipt":body["receipt_token"]}).json()["status"] == "ACKNOWLEDGED"
        monkeypatch.setenv("FLOODGUARD_ENV", "production")
        assert client.post(url, json={"status":"ASSIGNED"}, headers=headers).status_code == 503

def test_demo_operator_disabled_without_explicit_environment(monkeypatch):
    from fastapi.testclient import TestClient
    monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", "demo-operator-secret-very-long-123")
    for environment in ("staging", "development", "Production"):
        monkeypatch.setenv("FLOODGUARD_ENV", environment)
        response = TestClient(main.app).get("/api/v1/command-centre/overview", headers={"X-Demo-Operator-Token": "demo-operator-secret-very-long-123"})
        assert response.status_code == 503
