from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_only_sandbox_keys_accepted(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_API_KEY', 'fake-test-key')
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AD04C09UH20'})
    assert result.status_code == 503
    assert 'test keys' in result.json()['detail'].lower()

def test_provider_url_cannot_be_overridden(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_API_KEY', 'fake-test-key')
    monkeypatch.setenv('NIPOST_LOOKUP_URL', 'http://untrusted.example/lookup')
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AD04C09UH20'})
    assert result.status_code == 503
    assert 'test keys' in result.json()['detail'].lower()
