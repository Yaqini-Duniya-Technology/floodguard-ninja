from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_lookup_not_falsely_verified(monkeypatch):
    monkeypatch.delenv('NIPOST_INTEGRATION_ENABLED', raising=False)
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AB12C34DE56'})
    assert result.status_code == 503
    assert 'not configured' in result.json()['detail']

def test_invalid_postcode_rejected():
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'BAD!'})
    assert result.status_code == 422

def test_health_version():
    assert client.get('/health').json()['version'] == '2.6.0'
