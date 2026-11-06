import os
from fastapi.testclient import TestClient
from app import main

client = TestClient(main.app)

def sample(**kwargs):
    return dict(type='FLOOD', severity='HIGH', location=' Lokoja, Kogi ', description='Test only', **kwargs)

def test_security_headers():
    r = client.get('/health')
    assert r.headers['x-content-type-options'] == 'nosniff'
    assert r.headers['x-frame-options'] == 'DENY'
    assert r.headers['cache-control'] == 'no-store'
    assert len(r.headers['x-request-id']) > 10

def test_large_body_rejected():
    r = client.post('/api/v1/reports', content='x'*17000, headers={'content-type':'application/json'})
    assert r.status_code == 413

def test_receipt_is_private_and_postcode_unverified(tmp_path, monkeypatch):
    monkeypatch.setattr(main, 'DB_PATH', tmp_path / 'fg.db')
    r = client.post('/api/v1/reports', json=sample(postcode='AD-04-C09-UH-20'))
    assert r.status_code == 201, r.text
    body = r.json()
    assert body['postcode'] == 'AD04C09UH20'
    token = body['receipt_token']
    assert len(token) > 30
    path = f"/api/v1/reports/{body['id']}/status"
    assert client.get(path).status_code == 404
    assert client.get(path, headers={'X-Report-Receipt':'invalid'}).status_code == 404
    ok = client.get(path, headers={'X-Report-Receipt':token})
    assert ok.status_code == 200
    assert ok.json()['dispatch'] == 'not_connected'
    with main.connection() as db:
        assert db.execute('SELECT verification_status FROM report_postcodes').fetchone()[0] == 'UNVERIFIED'
        assert db.execute('SELECT token_hash FROM report_receipts').fetchone()[0] != token

def test_idempotency_rejects_duplicate(tmp_path, monkeypatch):
    monkeypatch.setattr(main, 'DB_PATH', tmp_path / 'fg.db')
    headers={'Idempotency-Key':'request_12345678'}
    assert client.post('/api/v1/reports', json=sample(), headers=headers).status_code == 201
    assert client.post('/api/v1/reports', json=sample(), headers=headers).status_code == 409
    with main.connection() as db:
        assert db.execute('SELECT COUNT(*) FROM reports').fetchone()[0] == 1

def test_invalid_postcode_does_not_submit(tmp_path, monkeypatch):
    monkeypatch.setattr(main, 'DB_PATH', tmp_path / 'fg.db')
    assert client.post('/api/v1/reports', json=sample(postcode='INVALID!')).status_code == 422
