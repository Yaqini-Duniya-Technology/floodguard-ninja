from fastapi.testclient import TestClient
from app.main import app
from app import main

def test_community_review_is_private_and_demo_only(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "community.sqlite3")
    monkeypatch.setenv("FLOODGUARD_ENV", "test")
    monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", "demo-operator-secret-very-long-123")
    client = TestClient(app)
    r = client.post("/api/v1/reports", json={"type":"rising","severity":"low","location":"Test location","description":"Test observation"})
    assert r.status_code == 201
    report = r.json()
    url = f"/api/v1/community/{report['id']}/review"
    assert client.get(url).status_code == 404
    headers = {"X-Report-Receipt": report["receipt_token"]}
    initial = client.get(url, headers=headers)
    assert initial.status_code == 200
    assert initial.json()["review_status"] == "UNVERIFIED"
    assert initial.json()["official_warning"] is False
    assert client.post(url, json={"decision":"REVIEWED"}).status_code == 403
    operator = {"X-Demo-Operator-Token": "demo-operator-secret-very-long-123"}
    result = client.post(url, json={"decision":"REVIEWED"}, headers=operator)
    assert result.status_code == 200
    assert result.json()["publicly_verified"] is False
    assert client.get(url, headers=headers).json()["review_status"] == "REVIEWED"
    monkeypatch.setenv("FLOODGUARD_ENV", "production")
    assert client.post(url, json={"decision":"REJECTED"}, headers=operator).status_code == 503
