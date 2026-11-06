"""Evidence-first geospatial assessments. No inferred safety from missing observations.

Only server-operator curated observations are loaded. A nearby observation is
context, NOT a building-level prediction or a government warning.
"""
import json
import math
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix='/api/v1/flood-risk', tags=['flood-risk'])

class AssessIn(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class Observation(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    observed_at: datetime
    source_name: str = Field(min_length=1)
    source_url: str = Field(min_length=1, pattern=r'^https://')
    kind: Literal['flood_observation', 'official_warning', 'flood_hazard_map']
    summary: str = Field(min_length=1)
    radius_km: float = Field(gt=0, le=100)

class Assessment(BaseModel):
    status: Literal['evidence_available', 'insufficient_data']
    risk_level: Literal['unknown'] = 'unknown'
    warning: str
    observations: list[Observation]
    assessed_at: datetime
    stale_observation_count: int = 0

def distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r1, r2 = math.radians(lat1), math.radians(lat2)
    dr, dl = r2-r1, math.radians(lon2-lon1)
    a = math.sin(dr/2)**2 + math.cos(r1)*math.cos(r2)*math.sin(dl/2)**2
    return 6371.0088 * 2 * math.asin(min(1.0, math.sqrt(a)))

def load_observations() -> list[Observation]:
    path = os.environ.get('FLOODGUARD_EVIDENCE_FILE')
    if not path:
        return []
    raw = json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(raw, list) or len(raw) > 10000:
        raise ValueError('Evidence must be a list of at most 10000 records')
    return [Observation.model_validate(item) for item in raw]

@router.post('/assess', response_model=Assessment)
def assess(payload: AssessIn):
    # Fail closed if the operator's evidence file is malformed.
    try:
        evidence = load_observations()
    except (OSError, ValueError, json.JSONDecodeError):
        raise HTTPException(status_code=503, detail='Risk evidence service unavailable')
    nearby = [e for e in evidence if distance_km(payload.latitude, payload.longitude, e.latitude, e.longitude) <= e.radius_km]
    now = datetime.now(timezone.utc)
    fresh = [e for e in nearby if timedelta(0) <= now - e.observed_at.astimezone(timezone.utc) <= timedelta(hours=72)]
    return Assessment(
        status='evidence_available' if fresh else 'insufficient_data',
        warning=('Recent sourced observations are available. They do not establish safety or predict building-level flood risk.'
                 if fresh else 'No recent validated local flood evidence is available. Flood risk is unknown; absence of data does not mean safety.'),
        observations=fresh[:20], assessed_at=now, stale_observation_count=len(nearby)-len(fresh))

@router.get('/observations', response_model=list[Observation])
def observations():
    """Return sourced observations only, never invented risk scores."""
    try:
        return load_observations()
    except (OSError, ValueError, json.JSONDecodeError):
        raise HTTPException(status_code=503, detail='Risk evidence service unavailable')
