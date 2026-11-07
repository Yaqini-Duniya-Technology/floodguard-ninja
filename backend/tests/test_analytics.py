from fastapi.testclient import TestClient
from app import main

def test_analytics_private_and_no_fabricated_outcomes(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "analytics.sqlite3")
    monkeypatch.setenv("FLOODGUARD_ENV", "test")
    monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", "demo-operator-secret-very-long-123")
    client=TestClient(main.app)
    created=client.post("/api/v1/reports",json={"type":"rising","severity":"low","location":"Private home address","description":"Private detail"})
    assert created.status_code==201
    url="/api/v1/analytics/operational-summary"
    assert client.get(url).status_code==403
    headers={"X-Demo-Operator-Token":"demo-operator-secret-very-long-123"}
    result=client.get(url,headers=headers)
    assert result.status_code==200
    body=result.json()
    assert body["reports_received"]==1
    assert body["reports_by_internal_status"]["PENDING"]==1
    assert body["real_responder_response_time_seconds"] is None
    assert body["confirmed_rescues"] is None
    assert body["warnings_delivered"] is None
    assert "Private home address" not in result.text
    monkeypatch.setenv("FLOODGUARD_ENV","production")
    assert client.get(url,headers=headers).status_code==503
