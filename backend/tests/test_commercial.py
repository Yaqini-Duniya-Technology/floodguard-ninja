from fastapi.testclient import TestClient
from app.main import app

def test_plans_are_not_purchasable():
    r=TestClient(app).get("/api/v1/commercial/plans")
    assert r.status_code==200
    body=r.json()
    assert body["payments_enabled"] is False
    assert body["subscriptions_enabled"] is False
    citizen=next(p for p in body["plans"] if p["id"]=="citizen")
    assert citizen["price_ngn"]==0
    assert all(p["price_ngn"] is None for p in body["plans"] if p["id"]!="citizen")
    assert body["status"]=="proposal_only"
