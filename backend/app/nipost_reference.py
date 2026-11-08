"""NIPOST test-mode geographic reference and postcode assembly.

Reference codes and assembled strings are NOT verified building locations.
Secret credentials never leave this backend.
"""
import os
import re
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/api/v1/postcodes", tags=["postcodes"])
BASE = "https://api.postcode.gov.ng"
PATTERNS = {"state": r"[A-Z]{2}", "lga": r"[0-9]{2}", "district": r"[A-Z][0-9]{2}", "area": r"[A-Z]{2}", "unit": r"[0-9]{2}"}

def key_for_reference():
    if os.getenv("NIPOST_INTEGRATION_ENABLED", "false").lower() != "true":
        raise HTTPException(503, "NIPOST sandbox integration is disabled.")
    key = os.getenv("NIPOST_API_KEY", "").strip()
    if not key.startswith("nipost_test_"):
        raise HTTPException(503, "A NIPOST sandbox secret key is required.")
    return key

def validate_part(name, value):
    value = value.strip().upper()
    if not re.fullmatch(PATTERNS[name], value):
        raise HTTPException(422, f"Invalid {name} segment.")
    return value

async def call_provider(method, path, *, params=None, payload=None):
    key = key_for_reference()
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=False, trust_env=False) as client:
            response = await client.request(method, BASE + path, params=params, json=payload, headers={"X-API-Key": key, "Accept": "application/json"})
    except httpx.RequestError:
        raise HTTPException(503, "NIPOST sandbox service is temporarily unavailable.") from None
    if response.status_code != 200:
        raise HTTPException(503, "NIPOST sandbox service did not complete the request.")
    try:
        data = response.json()["data"]
        if not isinstance(data, dict):
            raise ValueError("Expected data object")
        return data
    except (ValueError, KeyError, TypeError):
        raise HTTPException(503, "NIPOST sandbox returned an unexpected response.") from None

@router.get("/reference/states")
async def states():
    data = await call_provider("GET", "/v1/reference/states")
    if not isinstance(data.get("states"), list):
        raise HTTPException(503, "Invalid NIPOST states response.")
    return {"environment": "sandbox", "verified_building": False, "states": data["states"]}

@router.get("/reference/lgas")
async def lgas(state: str):
    data = await call_provider("GET", "/v1/reference/lgas", params={"state": validate_part("state", state)})
    if not isinstance(data.get("lgas"), list):
        raise HTTPException(503, "Invalid NIPOST LGAs response.")
    return {"environment": "sandbox", "verified_building": False, "lgas": data["lgas"]}

@router.get("/reference/districts")
async def districts(state: str, lga: str):
    params = {k: validate_part(k, v) for k, v in {"state": state, "lga": lga}.items()}
    data = await call_provider("GET", "/v1/reference/districts", params=params)
    if not isinstance(data.get("districts"), list):
        raise HTTPException(503, "Invalid NIPOST districts response.")
    return {"environment": "sandbox", "verified_building": False, "districts": data["districts"]}

@router.get("/reference/areas")
async def areas(state: str, lga: str, district: str):
    params = {k: validate_part(k, v) for k, v in {"state": state, "lga": lga, "district": district}.items()}
    data = await call_provider("GET", "/v1/reference/areas", params=params)
    if not isinstance(data.get("areas"), list):
        raise HTTPException(503, "Invalid NIPOST areas response.")
    return {"environment": "sandbox", "verified_building": False, "areas": data["areas"]}

class AssemblyIn(BaseModel):
    state: str
    lga: str
    district: str
    area: str
    unit: str

    @field_validator("state", "lga", "district", "area", "unit")
    @classmethod
    def validate_segment(cls, value, info):
        return validate_part(info.field_name, value)

@router.post("/assemble")
async def assemble(payload: AssemblyIn):
    data = await call_provider("POST", "/v1/assembly/assemble", payload=payload.model_dump())
    expected = "-".join(payload.model_dump().values())
    if data.get("postcode") != expected:
        raise HTTPException(503, "NIPOST returned an unexpected assembled postcode.")
    return {"environment": "sandbox", "verified_building": False, "verification_status": "not_verified", "postcode": data["postcode"], "display": data.get("display"), "compact": data.get("compact"), "notice": "Assembly checks postcode structure only. It does not confirm a building or an emergency location."}
