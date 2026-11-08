"""NIPOST L1 sandbox-only postcode validity adapter.

No administrative address or coordinates are inferred from an L1 response.
The secret key is read only from the backend environment.
"""
import os
import re
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix='/api/v1/postcodes', tags=['postcodes'])
CODE_PATTERN = re.compile(r'^[A-Z]{2}[0-9]{2}[A-Z][0-9]{2}[A-Z]{2}[0-9]{2}$')
NIPOST_API_BASE = 'https://api.postcode.gov.ng'

class ResolveIn(BaseModel):
    postcode: str = Field(min_length=1, max_length=40)

    @field_validator('postcode')
    @classmethod
    def normalize(cls, value: str) -> str:
        value = value.strip().upper().replace('-', '').replace(' ', '')
        if not CODE_PATTERN.fullmatch(value):
            raise ValueError('Expected postcode format SS-LL-PDD-AA-DD (11 letters/digits excluding hyphens).')
        return value

class ResolvedLocation(BaseModel):
    postcode: str
    status: str
    state: str | None = None
    lga: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    source: str = 'nipost_l1'


def credentials() -> str:
    if os.getenv('NIPOST_INTEGRATION_ENABLED', 'false').lower() != 'true':
        raise HTTPException(503, 'Official postcode verification is not enabled. Provide a descriptive location instead.')
    key = os.getenv('NIPOST_API_KEY', '').strip()
    if not key:
        raise HTTPException(503, 'Official postcode verification credentials are not configured.')
    if not key.startswith('nipost_test_'):
        raise HTTPException(503, 'Only NIPOST test keys are permitted in this L1 sandbox integration.')
    return key


@router.post('/resolve', response_model=ResolvedLocation)
async def resolve_postcode(payload: ResolveIn):
    key = credentials()
    code = payload.postcode
    canonical = f'{code[:2]}-{code[2:4]}-{code[4:7]}-{code[7:9]}-{code[9:]}'
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=False, trust_env=False) as client:
            response = await client.get(
                f'{NIPOST_API_BASE}/v1/lookup',
                params={'code': canonical, 'level': 1},
                headers={'X-API-Key': key, 'Accept': 'application/json'},
            )
    except httpx.RequestError:
        raise HTTPException(503, 'Postcode verification provider is temporarily unavailable.') from None
    if response.status_code in (401, 403):
        raise HTTPException(503, 'Postcode verification is not authorised for the configured test key.')
    if response.status_code == 429:
        raise HTTPException(503, 'Postcode verification is temporarily rate limited.')
    if response.status_code != 200:
        raise HTTPException(503, 'Postcode verification provider returned an unexpected response.')
    try:
        data = response.json()['data']
        valid = data['valid']
        if type(valid) is not bool:
            raise ValueError('valid must be a boolean')
    except (ValueError, KeyError, TypeError):
        raise HTTPException(503, 'Postcode verification provider response could not be validated.') from None
    # Intentionally discard all higher-level fields even if unexpectedly returned.
    return ResolvedLocation(postcode=canonical, status='verified' if valid else 'unconfirmed')
