from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_readiness_fails_closed_and_does_not_leak_secrets(monkeypatch):
    monkeypatch.setenv('NIPOST_API_KEY', 'nipost_test_super-secret-test-key')
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_LOOKUP_URL', 'https://api.example.test/lookup?token=secret-query')
    monkeypatch.setenv('NIPOST_ALLOWED_HOST', 'api.example.test')
    monkeypatch.setenv('NIPOST_CONTRACT_VERIFIED', 'true')
    result = client.get('/api/v1/integrations/nipost/readiness')
    assert result.status_code == 200
    assert result.json()['live_postcode_resolution_available'] is False
    assert result.json()['checks']['credentials_present'] is True
    assert 'nipost_test_super-secret-test-key' not in result.text
    assert 'secret-query' not in result.text
    assert 'api.example.test' not in result.text

def test_fixed_approved_host_is_not_overridden(monkeypatch):
    monkeypatch.setenv('NIPOST_LOOKUP_URL', 'https://unapproved.test/lookup')
    assert client.get('/api/v1/integrations/nipost/readiness').json()['checks']['approved_https_endpoint_configured'] is True
