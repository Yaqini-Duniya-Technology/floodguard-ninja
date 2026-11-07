"""Non-transactional commercial catalogue. No checkout or entitlement activation."""
from fastapi import APIRouter
router = APIRouter(prefix="/api/v1/commercial", tags=["commercial"])

@router.get("/plans")
def plans():
    return {
        "status": "proposal_only",
        "payments_enabled": False,
        "subscriptions_enabled": False,
        "currency": "NGN",
        "plans": [
            {"id":"citizen", "name":"Citizen Safety", "audience":"Residents and households", "pricing":"free", "price_ngn":0,
             "features":["General emergency safety guidance", "Community flood report submission when enabled", "Private report status lookup"],
             "availability":"prototype; individual services may be unavailable"},
            {"id":"institution", "name":"Institutional Intelligence", "audience":"Local authorities, schools, businesses and NGOs",
             "pricing":"quotation_required", "price_ngn":None,
             "features":["Institutional incident monitoring concept", "Review workflow concept", "Reporting and analytics roadmap"],
             "availability":"pilot proposal only; no live agency integration"},
            {"id":"enterprise", "name":"Enterprise / Government Integration", "audience":"Large organisations and government agencies",
             "pricing":"quotation_required", "price_ngn":None,
             "features":["Custom integration scoping", "Security and compliance assessment", "Service-level agreement negotiation"],
             "availability":"subject to agreements, procurement and technical validation"}
        ],
        "disclaimer": "Plans are illustrative, not purchasable. No payments, contracts, active subscriptions or guaranteed emergency response.",
    }
