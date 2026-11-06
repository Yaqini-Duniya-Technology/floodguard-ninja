from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_operational_status_is_explicit():
    data = client.get('/api/v1/status').json()
    assert data['dispatch'] == 'not_connected'
    assert data['postcode_lookup'] == 'not_verified'

def test_postcode_is_not_claimed_verified():
    response = client.post('/api/v1/reports', json={
        'type':'road', 'severity':'low', 'location':'Example bridge',
        'description':'Water observed', 'postcode':'TEST1234567'
    })
    assert response.status_code == 201
    assert response.json()['postcode'] == 'TEST1234567'
