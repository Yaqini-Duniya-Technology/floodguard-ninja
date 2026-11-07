"""Offline-capable, deterministic flood safety guidance. Not emergency dispatch."""
from fastapi import APIRouter, HTTPException
router = APIRouter(prefix="/api/v1/safety", tags=["safety"])
GUIDANCE = {
 "rising-water": {"title":"Water rising nearby","steps":["Move to higher ground if you can do so without entering floodwater.","Keep children and vulnerable people with you.","Avoid flooded roads, drains and bridges.","Contact official emergency services when in immediate danger."]},
 "trapped": {"title":"Trapped in a flooded building","steps":["Move to a higher level if safe; avoid enclosed attics without an escape route.","Do not enter moving floodwater or attempt to swim out.","Signal your location to responders using a phone, light or visible cloth if safe.","Conserve battery power and follow instructions from verified emergency responders."]},
 "driving": {"title":"Flooded road ahead","steps":["Do not drive or walk through floodwater.","Turn around and choose a safe, dry route if possible.","If stranded, contact official emergency services and follow their instructions.","Avoid touching electrical equipment or fallen power lines."]},
 "preparation": {"title":"Prepare before flooding","steps":["Monitor official weather and emergency warnings.","Prepare drinking water, essential medication, documents and a charged phone.","Identify a safe higher-ground meeting place with your household.","Follow official evacuation instructions promptly."]}
}
@router.get("/scenarios")
def scenarios():
 return {"source_type":"prewritten_general_guidance","dispatch_connected":False,"scenarios":[{"id":key,**value} for key,value in GUIDANCE.items()],"notice":"General safety information only; not a live emergency service or location-specific evacuation instruction."}
@router.get("/scenarios/{scenario_id}")
def scenario(scenario_id:str):
 if scenario_id not in GUIDANCE: raise HTTPException(404,"Unknown safety scenario")
 return {"id":scenario_id,**GUIDANCE[scenario_id],"source_type":"prewritten_general_guidance","dispatch_connected":False}
