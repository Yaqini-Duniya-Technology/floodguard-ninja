from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cannot_enable_without_verified_contract(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_LOOKUP_URL', 'https://example.com/lookup')
    monkeypatch.setenv('NIPOST_ALLOWED_HOST', 'example.com')
    monkeypatch.setenv('NIPOST_API_KEY', 'fake-test-key')
    monkeypatch.delenv('NIPOST_CONTRACT_VERIFIED', raising=False)
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AB12C34DE56'})
    assert result.status_code == 503
    assert 'contract' in result.json()['detail'].lower()

def test_blocks_insecure_endpoint(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_LOOKUP_URL', 'http://example.com/lookup')
    monkeypatch.setenv('NIPOST_ALLOWED_HOST', 'example.com')
    monkeypatch.setenv('NIPOST_API_KEY', 'fake-test-key')
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AB12C34DE56'})
    assert result.status_code == 503
    assert 'https' in result.json()['detail'].lower()

def test_blocks_unapproved_host(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_LOOKUP_URL', 'https://untrusted.example/lookup')
    monkeypatch.setenv('NIPOST_ALLOWED_HOST', 'example.com')
    monkeypatch.setenv('NIPOST_API_KEY', 'fake-test-key')
    result = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AB12C34DE56'})
    assert result.status_code == 503
