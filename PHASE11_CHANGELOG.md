# FloodGuard v2.1 — NIPOST Integration Security Gate

- Preserved all v2.0 frontend/backend files.
- Strengthened postcode adapter configuration validation (HTTPS and explicitly approved hostname).
- Requires separate integration enablement, API credential presence, and explicit verified-contract acknowledgement.
- No guessed external NIPOST endpoint, authentication format, or response schema.
- No fake successful lookups or emergency safety claims.
- Added three security regression tests.

## Blocked pending official documentation

Provider endpoint, authentication header, request method/body, postcode format, coordinate availability, and response schema. `NIPOST_CONTRACT_VERIFIED=true` alone does not enable a live request: the adapter intentionally remains fail-closed until implemented against documented specifications.

## Next steps

Obtain NIPOST developer API documentation and test credentials; implement the provider adapter and mock provider responses; run integration tests and frontend build; test the full user journey.
