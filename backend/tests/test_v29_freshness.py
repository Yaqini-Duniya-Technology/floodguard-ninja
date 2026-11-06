"""Evidence freshness: old and future observations must not count as recent."""
import json
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_stale_and_future_evidence_is_not_recent(monkeypatch, tmp_path):
    now = datetime.now(timezone.utc)
    entries = []
    for when in (now - timedelta(days=5), now + timedelta(hours=1)):
        entries.append({
            "latitude":7.8023,"longitude":6.7333,
            "observed_at":when.isoformat(),
            "source_name":"Test fixture","source_url":"https://example.org/observation",
            "kind":"flood_observation","summary":"Synthetic test evidence","radius_km":10
        })
    file = tmp_path / "evidence.json"
    file.write_text(json.dumps(entries), encoding="utf-8")
    monkeypatch.setenv("FLOODGUARD_EVIDENCE_FILE", str(file))
    result = client.post("/api/v1/flood-risk/assess", json={"latitude":7.8023,"longitude":6.7333})
    assert result.status_code == 200
    payload = result.json()
    assert payload["status"] == "insufficient_data"
    assert payload["risk_level"] == "unknown"
    assert payload["observations"] == []
    assert payload["stale_observation_count"] == 2

def test_recent_observation_is_context_not_risk_prediction(monkeypatch, tmp_path):
    entry = {"latitude":7.8023,"longitude":6.7333,"observed_at":datetime.now(timezone.utc).isoformat(),
             "source_name":"Test fixture","source_url":"https://example.org/observation",
             "kind":"flood_observation","summary":"Synthetic test evidence","radius_km":10}
    file = tmp_path / "evidence.json"
    file.write_text(json.dumps([entry]), encoding="utf-8")
    monkeypatch.setenv("FLOODGUARD_EVIDENCE_FILE", str(file))
    response = client.post("/api/v1/flood-risk/assess", json={"latitude":7.8023,"longitude":6.7333})
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "evidence_available"
    assert payload["risk_level"] == "unknown"
    assert len(payload["observations"]) == 1
