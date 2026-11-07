from fastapi.testclient import TestClient
from app import main

def test_command_centre_requires_demo_operator_and_hides_location(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "command.sqlite3")
    monkeypatch.setenv("FLOODGUARD_ENV", "test")
    monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", "demo-operator-secret-very-long-123")
    client = TestClient(main.app)
    created = client.post("/api/v1/reports", json={"type":"rising","severity":"high","location":"Private home address","description":"Sensitive report"})
    assert created.status_code == 201
    url = "/api/v1/command-centre/overview"
    assert client.get(url).status_code == 403
    r = client.get(url, headers={"X-Demo-Operator-Token":"demo-operator-secret-very-long-123"})
    assert r.status_code == 200
    body = r.json()
    assert body["dispatch"] == "not_connected"
    assert body["agency_authenticated"] is False
    assert len(body["incidents"]) == 1
    assert "Private home address" not in r.text
    assert "Sensitive report" not in r.text
    monkeypatch.setenv("FLOODGUARD_ENV", "production")
    assert client.get(url, headers={"X-Demo-Operator-Token":"demo-operator-secret-very-long-123"}).status_code == 503
