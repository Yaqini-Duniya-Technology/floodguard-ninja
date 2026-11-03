# FloodGuard AI v2.0 — Integration milestone

- Added `GET /api/v1/intelligence/overview?latitude=...&longitude=...` to combine weather forecasts, curated warning references and shelter directory results in one response.
- Each unavailable provider is explicitly marked unavailable; no empty data is interpreted as safety.
- Updated `/intelligence` React page to request the combined overview.
- Added overview endpoint tests for invalid coordinates and upstream outages.
- Updated API version and associated test assertion to 2.0.0.

## Remaining release blockers
- Official NIPOST API contract, credentials and real postcode lookup remain **unavailable**.
- Frontend production build and live weather request not verified in this environment.
- Public incident intake needs abuse controls, operational review and secure production database before real-world launch.
- Shelter and warning records require authoritative sourcing and regular verification.
- No emergency dispatch, official alerts or validated flood-risk model.

## Run locally
Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
Frontend: `npm install && npm run dev` with `VITE_FLOODGUARD_API_URL=http://localhost:8000` in a local `.env` file.
