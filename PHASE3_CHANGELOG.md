# Phase 3 — Postcode integration foundation (v1.3)

- Added isolated FastAPI postcode endpoint and typed response contract.
- Added 11-character alphanumeric provisional validation; requires official specification confirmation.
- Added a postcode verification field to community reporting. Lookup does not modify location automatically.
- When official credentials / endpoint are unavailable, API returns HTTP 503 rather than fabricated location data.
- Added frontend API client and backend tests for unavailable lookup and invalid input.
- Corrected misleading GPS auto-attachment and media-upload wording in reporting form.

## Not yet implemented
- Live NIPOST requests: official API endpoint, authentication, field mapping, and licensing terms must be confirmed.
- Postcode persistence with reports, geospatial flood risk, authenticated admin review.
- End-to-end deployment, frontend build verification.

## Next
Obtain official NIPOST developer docs without sharing credentials. Map response contract, add integration tests using sanctioned sample responses, then enable live lookup in a controlled environment.
