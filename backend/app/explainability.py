"""Evidence-only weather interpretation; not a flood prediction or safety classification."""
from datetime import datetime, timezone
from fastapi import APIRouter, Query
from .intelligence import weather

router = APIRouter(prefix="/api/v1/explainability", tags=["explainability"])

@router.get("/rainfall")
async def rainfall_explanation(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180)):
    result = await weather(latitude=latitude, longitude=longitude)
    rows = result["forecast"]
    observations = []
    for row in rows:
        rain = row.get("rainfall_mm")
        probability = row.get("rain_probability_percent")
        observations.append({
            "date": row["date"],
            "rainfall_mm": rain,
            "rain_probability_percent": probability,
            "interpretation": "Forecast precipitation only; local flood exposure cannot be determined from this measurement.",
            "missing_factors": ["river levels", "drainage capacity", "soil saturation", "terrain and elevation", "official warnings"],
        })
    return {
        "status": "weather_context_only",
        "classification": None,
        "safe_to_travel": None,
        "source": result["provider"],
        "source_url": result["provider_url"],
        "retrieved_at": result["retrieved_at"],
        "days": observations,
        "limitations": [
            "Rainfall forecasts do not establish a flood risk level for a building, road or community.",
            "No verified flood-risk model or calibration is connected to this endpoint.",
            "Missing or low predicted rainfall must not be interpreted as safe conditions.",
            "Follow official warnings and emergency instructions.",
        ],
    }
