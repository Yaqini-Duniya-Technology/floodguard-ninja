# Phase 4 — Evidence-first Geospatial Foundation (v1.4)

- Added `POST /api/v1/flood-risk/assess` with coordinate validation.
- Added great-circle proximity calculation for server-curated evidence.
- Evidence records require source name, source URL, date, kind, and explicit coverage radius.
- **No flood risk scores, low-risk verdicts, or official warnings are fabricated.** Risk level remains `unknown` until a validated risk model is implemented.
- No public endpoint to inject 'verified' evidence. Operator can configure `FLOODGUARD_EVIDENCE_FILE` pointing to a JSON array of curated records. Empty by default.
- Malformed evidence returns 503 instead of pretending data is absent.
- Added backend tests for missing data, validation, proximity, and failure handling.

## Pending

- Obtain official NIPOST API contract and credentials; postcode resolution is still disabled.
- Connect trusted real flood datasets and establish licensing, freshness, and spatial resolution.
- Connect frontend assessment display to verified coordinates after postcode resolution or explicit location consent.
- Production review: authentication, rate limiting, audit trails, security and deployment testing.
