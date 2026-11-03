from fastapi.testclient import TestClient
import httpx
from app.main import app

client = TestClient(app)

def test_valid_l1_response_is_verified_without_address(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_API_KEY', 'nipost_test_example')
    async def mock_get(self, url, **kwargs):
        assert url == 'https://api.postcode.gov.ng/v1/lookup'
        assert kwargs['params'] == {'code': 'AD-04-C09-UH-20', 'level': 1}
        assert kwargs['headers']['X-API-Key'] == 'nipost_test_example'
        return httpx.Response(200, json={'data': {'valid': True, 'administrative_address': {'state_name': 'DO NOT DISCLOSE'}}})
    monkeypatch.setattr(httpx.AsyncClient, 'get', mock_get)
    res = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AD-04-C09-UH-20'})
    assert res.status_code == 200
    assert res.json()['status'] == 'verified'
    assert res.json()['state'] is None
    assert 'DO NOT DISCLOSE' not in res.text

def test_invalid_from_provider(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_API_KEY', 'nipost_test_example')
    async def mock_get(self, url, **kwargs):
        return httpx.Response(200, json={'data': {'valid': False}})
    monkeypatch.setattr(httpx.AsyncClient, 'get', mock_get)
    assert client.post('/api/v1/postcodes/resolve', json={'postcode': 'AD04C09UH20'}).json()['status'] == 'invalid'

def test_live_key_rejected(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_API_KEY', 'nipost_live_example')
    res = client.post('/api/v1/postcodes/resolve', json={'postcode': 'AD04C09UH20'})
    assert res.status_code == 503
    assert 'nipost_live_example' not in res.text

def test_provider_failure_does_not_claim_verified(monkeypatch):
    monkeypatch.setenv('NIPOST_INTEGRATION_ENABLED', 'true')
    monkeypatch.setenv('NIPOST_API_KEY', 'nipost_test_example')
    async def mock_get(self, url, **kwargs):
        return httpx.Response(500, json={'error': 'internal'})
    monkeypatch.setattr(httpx.AsyncClient, 'get', mock_get)
    assert client.post('/api/v1/postcodes/resolve', json={'postcode': 'AD04C09UH20'}).status_code == 503
