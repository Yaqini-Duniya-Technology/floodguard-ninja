from fastapi.testclient import TestClient
from app.main import app
from app import overview

client = TestClient(app)

def test_overview_rejects_invalid_coordinates():
    response = client.get('/api/v1/intelligence/overview?latitude=100&longitude=0')
    assert response.status_code == 422

def test_overview_handles_unavailable_providers(monkeypatch):
    async def down(*args):
        raise RuntimeError('provider token should never be exposed')
    monkeypatch.setattr(overview, 'weather', down)
    response = client.get('/api/v1/intelligence/overview?latitude=9&longitude=7')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'partial'
    assert data['services']['weather']['status'] == 'unavailable'
    assert 'provider token' not in str(data)
    assert data['postcode_status'] == 'not_connected'
