# FloodGuard AI v2.2 — Integration Readiness and Showcase Evidence Gate

## Added
- `GET /api/v1/integrations/nipost/readiness` provides a safe configuration checklist without returning API keys or URLs.
- Automated checks for secret non-disclosure and endpoint host mismatch.
- NIPOST onboarding checklist and evidence requirements (`NIPOST_ONBOARDING.md`).

## Still blocked
The official NIPOST API contract has not been independently confirmed. **No real postcode lookup is implemented or claimed.** The existing postcode route intentionally returns 503. No actual flood alerts, emergency dispatch, or real-time postcode verification should be advertised.

## Demo scope
Demonstrate existing UI and documented backend features with clear development/demo labels. Do not call the app a verified official NIPOST integration until a real successful request and mapping have been tested with authorized credentials.
