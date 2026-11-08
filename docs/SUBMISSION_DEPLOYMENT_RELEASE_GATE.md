# FloodGuard AI — Submission and free-hosting release gate

Developed by Yaqini & Duniya Technology.

## Evidence: NIPOST Level 1
1. Run backend locally with `NIPOST_INTEGRATION_ENABLED=true` and a privately configured authorised `nipost_test_` key. Do not paste the key into the UI, screenshots, GitHub or chat.
2. At `/postcode`, enter an officially documented test postcode. Record the actual response and time. A `verified` response proves only the provider's Level 1 validity result, **not** an address, coordinates, residence or flood-risk prediction.
3. If credentials are missing, denied, throttled, or the provider is unavailable, record the actual 503 message. Enter a fictional descriptive location using the fallback and continue to the report page. Never manufacture a successful lookup or claim a local mock is the official service.
4. Compare the dashboard result and API result if they differ. Document the discrepancy.

## Unauthorized access
Run `python -m pytest -q` from backend; the v2.9 regression includes missing/wrong token -> 403, correct demo token -> 200, production even with token -> 503 for restricted overview and audit endpoints. Manually verify the same in browser with no token, incorrect token and valid demo token. Never record a real token.

## Free deployment: safe public demo
- **Vercel frontend**: Import GitHub repo; framework Vite, root directory repo root, build `npm run build`, output `dist`. Add `VITE_FLOODGUARD_API_URL=https://YOUR-RENDER-SERVICE.onrender.com` as a build-time environment variable; rebuild after changing it.
- **Render backend**: Deploy `render.yaml` Blueprint or Python web service with root `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `FLOODGUARD_ENV=production`; `FLOODGUARD_ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app`; `FLOODGUARD_REPORTING_ENABLED=false`; `NIPOST_INTEGRATION_ENABLED=false`. Do not set operator demo credentials in production. Do not configure live NIPOST credentials for the public demo.
- The Render public backend can serve `/health`, `/api/v1/status`, and non-sensitive demonstration endpoints. Public incident submission stays disabled (503), and operator access stays disabled (503). A public link **does not** establish durable report storage or live emergency service.
- The existing SQLite application requires a durable database path for any production reporting. Do not enable `FLOODGUARD_REPORTING_ENABLED=true` without durable storage, real authentication, operational monitoring, and an approved data-protection review.
- Check the actual Vercel and Render dashboards for current free-plan eligibility, sleep/usage limits, and domain assignment; do not invent a live URL.

## Privacy and safety release gate
- Only fictional incidents; do not transfer local test SQLite databases to public hosting.
- No receipts, demo operator tokens, API keys, personal addresses, descriptions or private notes in screenshots.
- Postcode L1 is validity only; verified geolocation is not operational.
- Emergency dispatch, automatic agency notification, and validated flood prediction are **not operational**.
- Mark illustrative dashboard counts, forecasts and maps as demo/sample wherever they appear.
- Verify CORS permits only the approved frontend origin and that the frontend displays an honest disabled-reporting message on the public demo.
- Record backend tests, frontend build, browser checks, public health URL and demo screenshots before asking for merge or deployment approval.

## Final go/no-go
No merge into main and no production deployment until user approval. A green test suite is not proof of a live NIPOST lookup or live hosting.
