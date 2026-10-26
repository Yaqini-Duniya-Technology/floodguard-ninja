"""Unified, fail-open *display* of environmental evidence; never a safety clearance."""
from datetime import datetime, timezone
from fastapi import APIRouter, Query
from .intelligence import weather, shelters, alerts

router = APIRouter(prefix='/api/v1/intelligence', tags=['intelligence'])

@router.get('/overview')
async def overview(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180)):
    """One request for UI; provider failures are explicit and independent."""
    result = {}
    for name, operation in (
        ('weather', lambda: weather(latitude, longitude)),
        ('alerts', lambda: alerts(latitude, longitude)),
        ('shelters', lambda: shelters(latitude, longitude, 30)),
    ):
        try:
            value = operation()
            if hasattr(value, '__await__'):
                value = await value
            result[name] = value
        except Exception:
            # Never expose upstream errors or pretend that an empty result means safety.
            result[name] = {'status': 'unavailable', 'message': 'Source unavailable; no safety conclusion can be drawn.'}
    return {
        'status': 'partial' if any(v.get('status') == 'unavailable' for v in result.values()) else 'available',
        'retrieved_at': datetime.now(timezone.utc).isoformat(),
        'location': {'latitude': latitude, 'longitude': longitude, 'source': 'user_entered_unverified'},
        'services': result,
        'postcode_status': 'not_connected',
        'disclaimer': 'Weather and curated evidence are not a flood safety determination. Missing warnings do not indicate safety. No emergency dispatch is connected.',
    }
