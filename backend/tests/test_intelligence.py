from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_status_discloses_missing_services(monkeypatch):
    monkeypatch.delenv('FLOODGUARD_SHELTERS_FILE', raising=False)
    monkeypatch.delenv('FLOODGUARD_EVIDENCE_FILE', raising=False)
    r = client.get('/api/v1/intelligence/status')
    assert r.status_code == 200
    assert r.json()['postcode_api'] == 'awaiting_official_contract'
    assert r.json()['emergency_dispatch'] == 'not_connected'

def test_empty_shelters(monkeypatch):
    monkeypatch.delenv('FLOODGUARD_SHELTERS_FILE', raising=False)
    r = client.get('/api/v1/intelligence/shelters?latitude=9&longitude=7')
    assert r.status_code == 200
    assert r.json()['status'] == 'not_configured'
    assert r.json()['shelters'] == []

def test_bad_coordinates():
    assert client.get('/api/v1/intelligence/alerts?latitude=100&longitude=7').status_code == 422

def test_curated_alerts_not_fabricated(monkeypatch):
    monkeypatch.delenv('FLOODGUARD_EVIDENCE_FILE', raising=False)
    r = client.get('/api/v1/intelligence/alerts?latitude=9&longitude=7')
    assert r.status_code == 200
    assert r.json()['alerts'] == []
