"""Contract tests for NIPOST sandbox reference and postcode assembly.

No live NIPOST requests are made. Secret key must never reach response bodies.
"""
import httpx
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def enable(monkeypatch):
    monkeypatch.setenv("NIPOST_INTEGRATION_ENABLED", "true")
    monkeypatch.setenv("NIPOST_API_KEY", "nipost_test_contract_only")

def test_reference_hierarchy(monkeypatch):
    enable(monkeypatch)
    expected = [
        ("/v1/reference/states", None, "states"),
        ("/v1/reference/lgas", {"state": "FC"}, "lgas"),
        ("/v1/reference/districts", {"state": "FC", "lga": "01"}, "districts"),
        ("/v1/reference/areas", {"state": "FC", "lga": "01", "district": "A01"}, "areas"),
    ]
    async def mock_request(self, method, url, **kwargs):
        assert method == "GET"
        assert kwargs["headers"]["X-API-Key"] == "nipost_test_contract_only"
        for path, params, field in expected:
            if url.endswith(path):
                assert kwargs.get("params") == params
                return httpx.Response(200, json={"data": {field: [{"code": "FC", "name": "Sample"}]}})
        raise AssertionError(f"Unexpected URL {url}")
    monkeypatch.setattr(httpx.AsyncClient, "request", mock_request)
    paths = [
        "/api/v1/postcodes/reference/states",
        "/api/v1/postcodes/reference/lgas?state=FC",
        "/api/v1/postcodes/reference/districts?state=FC&lga=01",
        "/api/v1/postcodes/reference/areas?state=FC&lga=01&district=A01",
    ]
    for (_, _, field), path in zip(expected, paths):
        response = client.get(path)
        assert response.status_code == 200
        assert response.json()["verified_building"] is False
        assert len(response.json()[field]) == 1
        assert "nipost_test_contract_only" not in response.text

def test_assemble_does_not_claim_building_verified(monkeypatch):
    enable(monkeypatch)
    segments = {"state": "FC", "lga": "01", "district": "A01", "area": "KP", "unit": "27"}
    async def mock_request(self, method, url, **kwargs):
        assert method == "POST"
        assert url.endswith("/v1/assembly/assemble")
        assert kwargs["json"] == segments
        return httpx.Response(200, json={"data": {"postcode": "FC-01-A01-KP-27", "display": "FC 01 A01 KP 27", "compact": "FC01A01KP27"}})
    monkeypatch.setattr(httpx.AsyncClient, "request", mock_request)
    response = client.post("/api/v1/postcodes/assemble", json=segments)
    assert response.status_code == 200
    assert response.json()["postcode"] == "FC-01-A01-KP-27"
    assert response.json()["verification_status"] == "not_verified"
    assert response.json()["verified_building"] is False

def test_disabled_without_key(monkeypatch):
    monkeypatch.setenv("NIPOST_INTEGRATION_ENABLED", "false")
    monkeypatch.delenv("NIPOST_API_KEY", raising=False)
    assert client.get("/api/v1/postcodes/reference/states").status_code == 503

def test_reject_bad_segments_before_provider(monkeypatch):
    enable(monkeypatch)
    assert client.get("/api/v1/postcodes/reference/lgas?state=FCT").status_code == 422
    assert client.post("/api/v1/postcodes/assemble", json={"state": "FC", "lga": "01", "district": "A01", "area": "KP", "unit": "999"}).status_code == 422

def test_provider_error_is_not_leaked(monkeypatch):
    enable(monkeypatch)
    async def mock_request(self, method, url, **kwargs):
        return httpx.Response(500, json={"error": "secret provider diagnostics"})
    monkeypatch.setattr(httpx.AsyncClient, "request", mock_request)
    response = client.get("/api/v1/postcodes/reference/states")
    assert response.status_code == 503
    assert "secret provider diagnostics" not in response.text
