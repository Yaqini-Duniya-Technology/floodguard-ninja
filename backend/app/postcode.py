"""Fail-closed NIPOST adapter. Configure ONLY from verified provider documentation."""
import os
import re
from urllib.parse import urlparse
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix='/api/v1/postcodes', tags=['postcodes'])
CODE_PATTERN = re.compile(r'^[A-Z0-9]{11}$')  # Provisional; confirm with NIPOST.

class ResolveIn(BaseModel):
    postcode: str = Field(min_length=1, max_length=40)

    @field_validator('postcode')
    @classmethod
    def normalize(cls, value: str) -> str:
        value = value.strip().upper().replace('-', '').replace(' ', '')
        if not CODE_PATTERN.fullmatch(value):
            raise ValueError('Expected 11 letters/digits; hyphens and spaces are accepted as display separators.')
        return value

class ResolvedLocation(BaseModel):
    postcode: str
    status: str
    state: str | None = None
    lga: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    source: str = 'nipost'


def provider_settings():
    if os.getenv('NIPOST_INTEGRATION_ENABLED', 'false').lower() != 'true':
        raise HTTPException(503, 'Official postcode lookup is not configured yet. Enter a descriptive location instead.')
    url = os.getenv('NIPOST_LOOKUP_URL', '')
    parsed = urlparse(url)
    allowed_host = os.getenv('NIPOST_ALLOWED_HOST', '').lower()
    if parsed.scheme != 'https' or not parsed.hostname or not allowed_host or parsed.hostname.lower() != allowed_host or parsed.username or parsed.password or parsed.fragment:
        raise HTTPException(503, 'Verified NIPOST HTTPS endpoint and hostname must be configured.')
    key = os.getenv('NIPOST_API_KEY', '')
    if not key:
        raise HTTPException(503, 'NIPOST API credentials are not configured.')
    # Header name, method, request shape and response mapping are not known yet.
    # Do not send credentials or traffic until all are verified.
    if os.getenv('NIPOST_CONTRACT_VERIFIED', 'false').lower() != 'true':
        raise HTTPException(503, 'Official NIPOST API contract has not been verified.')
    return url, key


@router.post('/resolve', response_model=ResolvedLocation)
async def resolve_postcode(payload: ResolveIn):
    provider_settings()
    # Intentionally fail closed. A verified contract implementation must replace
    # this boundary after NIPOST publishes the HTTP method, auth and schema.
    raise HTTPException(503, 'Provider adapter awaits verified request and response schema.')
