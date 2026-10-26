import json
from fastapi.testclient import TestClient
from app.main import app
from app.geospatial import distance_km

client = TestClient(app)

def test_unknown_without_evidence(monkeypatch):
    monkeypatch.delenv('FLOODGUARD_EVIDENCE_FILE', raising=False)
    result = client.post('/api/v1/flood-risk/assess', json={'latitude': 9.1, 'longitude': 7.4})
    assert result.status_code == 200
    assert result.json()['risk_level'] == 'unknown'
    assert result.json()['status'] == 'insufficient_data'

def test_bad_coordinates():
    assert client.post('/api/v1/flood-risk/assess', json={'latitude': 91, 'longitude': 7}).status_code == 422

def test_evidence_context_not_risk_prediction(tmp_path, monkeypatch):
    file = tmp_path / 'evidence.json'
    file.write_text(json.dumps([{'latitude': 9.1, 'longitude': 7.4, 'observed_at': '2026-10-19T12:00:00Z', 'source_name': 'Test only', 'source_url': 'https://example.org/test', 'kind': 'flood_observation', 'summary': 'Test observation, not live data', 'radius_km': 5}]))
    monkeypatch.setenv('FLOODGUARD_EVIDENCE_FILE', str(file))
    result = client.post('/api/v1/flood-risk/assess', json={'latitude': 9.1, 'longitude': 7.4})
    assert result.status_code == 200
    assert result.json()['status'] == 'evidence_available'
    assert result.json()['risk_level'] == 'unknown'
    assert len(result.json()['observations']) == 1

def test_distance():
    assert distance_km(0, 0, 0, 0) == 0
    assert 110 < distance_km(0, 0, 1, 0) < 112

def test_invalid_evidence_fails_closed(tmp_path, monkeypatch):
    file = tmp_path / 'bad.json'
    file.write_text('not json')
    monkeypatch.setenv('FLOODGUARD_EVIDENCE_FILE', str(file))
    assert client.post('/api/v1/flood-risk/assess', json={'latitude': 9.1, 'longitude': 7.4}).status_code == 503
