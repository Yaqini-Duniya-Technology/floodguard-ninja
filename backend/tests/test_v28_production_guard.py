import os
from fastapi.testclient import TestClient
from app.main import app


def test_production_blocks_public_reports_without_opt_in(monkeypatch):
    monkeypatch.setenv("FLOODGUARD_ENV", "production")
    monkeypatch.delenv("FLOODGUARD_REPORTING_ENABLED", raising=False)
    client = TestClient(app)
    result = client.post("/api/v1/reports", json={"type":"flood", "severity":"high", "location":"Test street", "description":"Test only"})
    assert result.status_code == 503
    assert "not yet enabled" in result.json()["detail"]
    status = client.get("/api/v1/status")
    assert status.json()["reporting"] == "disabled_pending_durable_storage"


def test_health_still_available_in_production(monkeypatch):
    monkeypatch.setenv("FLOODGUARD_ENV", "production")
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json()["version"] == "2.8.0"
