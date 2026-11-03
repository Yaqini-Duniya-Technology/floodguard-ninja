"""Context-only environmental intelligence. Never emits a safety verdict."""
import json, os
from datetime import datetime, timezone
from pathlib import Path
import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
from .geospatial import distance_km, load_observations

router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])

class Place(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    source_name: str = Field(min_length=2)
    source_url: HttpUrl
    verified_at: datetime
    details: str = Field(default="", max_length=500)

def load_places():
    file = os.getenv("FLOODGUARD_SHELTERS_FILE")
    if not file:
        return []
    try:
        raw = json.loads(Path(file).read_text(encoding="utf-8"))
        if not isinstance(raw, list) or len(raw) > 5000:
            raise ValueError("Invalid shelter collection")
        return [Place.model_validate(row) for row in raw]
    except (OSError, ValueError) as exc:
        raise HTTPException(503, "Verified shelter registry unavailable") from exc

@router.get("/weather")
async def weather(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180)):
    """Open-Meteo forecast is weather context, NOT a flood warning."""
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=False) as client:
            response = await client.get("https://api.open-meteo.com/v1/forecast", params={
                "latitude": latitude, "longitude": longitude,
                "daily": "precipitation_sum,precipitation_probability_max",
                "forecast_days": 3, "timezone": "auto"})
            response.raise_for_status()
            body = response.json()
            daily = body["daily"]
            rows = [{"date": day, "rainfall_mm": rain, "rain_probability_percent": probability}
                    for day, rain, probability in zip(daily["time"], daily["precipitation_sum"], daily["precipitation_probability_max"])]
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(503, "Weather provider currently unavailable") from exc
    return {"status": "forecast_available", "provider": "Open-Meteo", "provider_url": "https://open-meteo.com/",
            "retrieved_at": datetime.now(timezone.utc).isoformat(), "forecast": rows,
            "disclaimer": "Weather forecast only; not an official flood alert or building-level risk assessment."}

@router.get("/shelters")
def shelters(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180), radius_km: float = Query(default=30, gt=0, le=100)):
    places = [(round(distance_km(latitude, longitude, p.latitude, p.longitude), 2), p) for p in load_places()]
    nearby = sorted(((d, p) for d, p in places if d <= radius_km), key=lambda pair: pair[0])[:20]
    return {"status": "directory_available" if os.getenv("FLOODGUARD_SHELTERS_FILE") else "not_configured",
            "shelters": [{**p.model_dump(mode="json"), "distance_km": d} for d, p in nearby],
            "disclaimer": "Shelter information must be independently confirmed before travel. Availability is not guaranteed."}

@router.get("/alerts")
def alerts(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180)):
    try:
        observations = load_observations()
    except (OSError, ValueError):
        raise HTTPException(503, "Curated warning evidence unavailable")
    matches = [o for o in observations if o.kind == "official_warning" and
               distance_km(latitude, longitude, o.latitude, o.longitude) <= o.radius_km]
    return {"status": "curated_evidence" if os.getenv("FLOODGUARD_EVIDENCE_FILE") else "not_configured",
            "alerts": [o.model_dump(mode="json") for o in matches[:20]],
            "disclaimer": "Operator-curated references only; this is not a complete live government warning feed. No alerts does not mean no danger."}

@router.get("/status")
def status():
    return {"postcode_api": "awaiting_official_contract", "weather": "live_on_request",
            "flood_risk": "evidence_only", "shelters": "curated_directory" if os.getenv("FLOODGUARD_SHELTERS_FILE") else "not_configured",
            "alerts": "curated_evidence" if os.getenv("FLOODGUARD_EVIDENCE_FILE") else "not_configured",
            "emergency_dispatch": "not_connected"}
