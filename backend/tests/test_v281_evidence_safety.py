"""Regression checks for evidence-first risk and sandbox-only postcode readiness."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_no_evidence_does_not_imply_safety(monkeypatch):
    monkeypatch.delenv("FLOODGUARD_EVIDENCE_FILE", raising=False)
    result = client.post("/api/v1/flood-risk/assess", json={"latitude": 7.8023, "longitude": 6.7333})
    assert result.status_code == 200
    data = result.json()
    assert data["status"] == "insufficient_data"
    assert data["risk_level"] == "unknown"
    assert data["observations"] == []

def test_nipost_disabled_by_default(monkeypatch):
    monkeypatch.setenv("NIPOST_INTEGRATION_ENABLED", "false")
    monkeypatch.delenv("NIPOST_API_KEY", raising=False)
    readiness = client.get("/api/v1/integrations/nipost/readiness")
    assert readiness.status_code == 200
    assert readiness.json()["live_postcode_resolution_available"] is False
    result = client.post("/api/v1/postcodes/resolve", json={"postcode": "AB12C34DE56"})
    assert result.status_code == 503
