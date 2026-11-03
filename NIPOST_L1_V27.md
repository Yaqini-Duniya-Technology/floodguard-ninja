# FloodGuard AI v2.7 — NIPOST L1 sandbox integration

Official reference: https://docs.postcode.gov.ng/quickstart

## Implemented
- Backend-only NIPOST GET `https://api.postcode.gov.ng/v1/lookup?code=...&level=1` with `X-API-Key`.
- Only `nipost_test_` sandbox keys are accepted; no live credentials are used.
- Strict postcode display-format checking, timeout and error handling.
- `valid: true` => `verified`; `valid: false` => `invalid`. No state, LGA, address, or coordinates returned by FloodGuard at L1.
- Frontend shows explicit invalid result; descriptive location remains necessary.
- Readiness endpoint reports *configured*, not successfully tested against NIPOST.

## Configure privately on Render (backend environment only)
- `NIPOST_INTEGRATION_ENABLED=true`
- `NIPOST_API_KEY=<your actual nipost_test_... secret>`
- `FLOODGUARD_ALLOWED_ORIGINS=https://<your-vercel-domain>`
- `FLOODGUARD_DB_PATH=<path on persistent disk>` before enabling public incident reporting.

Do not place the key in the Vite frontend, GitHub, screenshots, or chat. No production API requests or live key support is included.

## Verification
Run `cd backend && python -m pytest -q` and `npm ci && npm run build` from the repository root when Node/npm dependencies are available.

The tests mock NIPOST responses. A successful real sandbox lookup and frontend build are still required before calling the integration operational.
