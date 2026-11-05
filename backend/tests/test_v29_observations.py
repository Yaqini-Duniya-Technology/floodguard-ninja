"""v2.9 evidence catalog contracts."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_observation_catalog_empty_without_config(monkeypatch):
    monkeypatch.delenv("FLOODGUARD_EVIDENCE_FILE", raising=False)
    result = client.get("/api/v1/flood-risk/observations")
    assert result.status_code == 200
    assert result.json() == []

def test_observation_catalog_source_and_timestamp(monkeypatch, tmp_path):
    path = tmp_path / "evidence.json"
    path.write_text('[{"latitude":7.8,"longitude":6.7,"observed_at":"2026-11-01T12:00:00Z","source_name":"Test evidence","source_url":"https://example.org/evidence","kind":"flood_observation","summary":"Test observation, not a warning","radius_km":5}]')
    monkeypatch.setenv("FLOODGUARD_EVIDENCE_FILE", str(path))
    response = client.get("/api/v1/flood-risk/observations")
    assert response.status_code == 200
    assert response.json()[0]["source_url"] == "https://example.org/evidence"

def test_catalog_rejects_invalid_source(monkeypatch, tmp_path):
    path = tmp_path / "bad.json"
    path.write_text('[{"latitude":7.8,"longitude":6.7,"observed_at":"2026-11-01T12:00:00Z","source_name":"Test","source_url":"javascript:alert(1)","kind":"flood_observation","summary":"Test","radius_km":5}]')
    monkeypatch.setenv("FLOODGUARD_EVIDENCE_FILE", str(path))
    assert client.get("/api/v1/flood-risk/observations").status_code == 503
