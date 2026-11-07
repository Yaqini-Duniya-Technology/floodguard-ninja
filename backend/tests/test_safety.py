from fastapi.testclient import TestClient
from app.main import app

def test_scenarios_work_without_external_services():
 response=TestClient(app).get("/api/v1/safety/scenarios")
 assert response.status_code==200
 body=response.json()
 assert body["dispatch_connected"] is False
 assert len(body["scenarios"])==4
 assert all(s["steps"] for s in body["scenarios"])

def test_scenario_lookup_and_unknown():
 client=TestClient(app)
 assert client.get("/api/v1/safety/scenarios/trapped").status_code==200
 assert client.get("/api/v1/safety/scenarios/unknown").status_code==404
