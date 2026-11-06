# Phase 2 — Centralised reporting foundation

- Added a FastAPI backend with SQLite persistence, health endpoint, validated POST /api/v1/reports.
- Public report listing deliberately disabled pending authenticated admin access.
- Connected the report submission UI to the backend via VITE_FLOODGUARD_API_URL.
- Failed submissions show errors and are NOT silently saved as successful reports.
- Removed false claims of emergency dispatch and AI analysis from report submission.
- Image preview is NOT uploaded; image upload requires secure storage and moderation.
- Existing dashboard local reports are NOT synchronised with central reports; admin dashboard is a later phase.
- No official NIPOST API integration is claimed.

## Run locally

Backend: `cd backend; python -m venv .venv; pip install -r requirements.txt; uvicorn app.main:app --reload --port 8000`
Frontend: copy `.env.example` to `.env`, then `npm install` and `npm run dev`.

## Limitations before public deployment

Add rate limiting, anti-spam controls, consent/privacy notice, retention policy, access controls, monitoring, and production-grade database management. SQLite is a prototype store, not the final production database. No emergency dispatch is connected. Do not deploy the intake endpoint publicly without abuse protections.
