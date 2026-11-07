from fastapi.testclient import TestClient
from app.main import app
from app import explainability

def test_explainable_rainfall_has_no_safety_verdict(monkeypatch):
    async def fake_weather(latitude, longitude):
        return {"provider":"Open-Meteo","provider_url":"https://open-meteo.com/","retrieved_at":"2026-11-07T00:00:00+00:00","forecast":[{"date":"2026-11-08","rainfall_mm":12.0,"rain_probability_percent":80}]}
    monkeypatch.setattr(explainability,"weather",fake_weather)
    client=TestClient(app)
    r=client.get("/api/v1/explainability/rainfall?latitude=9&longitude=7")
    assert r.status_code==200
    body=r.json()
    assert body["classification"] is None
    assert body["safe_to_travel"] is None
    assert body["days"][0]["rainfall_mm"]==12.0
    assert body["limitations"]
    assert client.get("/api/v1/explainability/rainfall?latitude=100&longitude=7").status_code==422
