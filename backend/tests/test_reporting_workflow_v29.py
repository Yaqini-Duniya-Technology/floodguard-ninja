"""End-to-end local API regression; no live NIPOST or emergency providers."""
from pathlib import Path
from fastapi.testclient import TestClient
from app import main
from app import postcode

DEMO_TOKEN = "local-demo-operator-token-very-long"

def test_postcode_fallback_report_receipt_rotation_and_audit(monkeypatch, tmp_path):
    monkeypatch.setattr(main, "DB_PATH", Path(tmp_path) / "flow.sqlite3")
    monkeypatch.setenv("FLOODGUARD_ENV", "test")
    monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", DEMO_TOKEN)
    monkeypatch.delenv("NIPOST_API_KEY", raising=False)
    client = TestClient(main.app)
    unavailable = client.post("/api/v1/postcodes/resolve", json={"postcode": "AD-05-E50-LH-05"})
    assert unavailable.status_code == 503
    created = client.post("/api/v1/reports", json={
        "type": "drainage", "severity": "med", "location": "TEST: Sample LGA",
        "description": "SIMULATION ONLY", "postcode": "AD-05-E50-LH-05"})
    assert created.status_code == 201, created.text
    report = created.json()
    report_id, token = report["id"], report["receipt_token"]
    status_url = f"/api/v1/reports/{report_id}/status"
    assert client.get(status_url).status_code == 404
    assert client.get(status_url, headers={"X-Report-Receipt": token}).json()["status"] == "PENDING"
    assert client.get("/api/v1/command-centre/overview").status_code == 403
    operator = {"X-Demo-Operator-Token": DEMO_TOKEN}
    overview = client.get("/api/v1/command-centre/overview", headers=operator)
    assert overview.status_code == 200
    assert any(row["id"] == report_id for row in overview.json()["incidents"])
    assert all("location" not in row for row in overview.json()["incidents"])
    transition = client.post(f"/api/v1/incidents/{report_id}/transitions",
        headers=operator, json={"status": "ACKNOWLEDGED", "note": "Sensitive private note"})
    assert transition.status_code == 200
    audit = client.get("/api/v1/operator/audit", headers=operator)
    assert audit.status_code == 200
    assert "Sensitive private note" not in audit.text
    assert "TEST: Sample LGA" not in audit.text
    assert client.get("/api/v1/operator/audit").status_code == 403
    rotated = client.post(f"/api/v1/reports/{report_id}/rotate-receipt",
        headers={"X-Report-Receipt": token})
    assert rotated.status_code == 200
    new_token = rotated.json()["receipt_token"]
    assert new_token != token
    assert client.get(status_url, headers={"X-Report-Receipt": token}).status_code == 404
    assert client.get(status_url, headers={"X-Report-Receipt": new_token}).json()["status"] == "ACKNOWLEDGED"
    assert client.post(f"/api/v1/reports/{report_id}/rotate-receipt",
        headers={"X-Report-Receipt": token}).status_code == 404

def test_operator_disabled_in_production(monkeypatch, tmp_path):
    monkeypatch.setattr(main, "DB_PATH", Path(tmp_path) / "production.sqlite3")
    monkeypatch.setenv("FLOODGUARD_ENV", "production")
    monkeypatch.setenv("FLOODGUARD_DEMO_OPERATOR_TOKEN", DEMO_TOKEN)
    client = TestClient(main.app)
    assert client.get("/api/v1/operator/audit", headers={"X-Demo-Operator-Token": DEMO_TOKEN}).status_code == 503
