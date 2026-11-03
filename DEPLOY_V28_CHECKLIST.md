# FloodGuard AI v2.8 — deployment checklist

## What changed
- Production incident intake defaults to **disabled** until explicitly enabled.
- `/api/v1/status` reports whether intake is enabled.
- `/health` remains public for Render health checks.
- No NIPOST secret is included. L1 sandbox only; no L2 address or coordinate access is claimed.

## GitHub and Render
1. Create a **private** GitHub repository for this project and upload the source files (not the ZIP itself). Keep `.env` and API keys out of Git.
2. Render: New → Web Service → connect the repository. Use `render.yaml` as a reference or create a Blueprint from it. `rootDir` is `backend`; build command `pip install -r requirements.txt`; start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Set `FLOODGUARD_ENV=production`, `FLOODGUARD_REPORTING_ENABLED=false`, and `FLOODGUARD_ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN`.
4. **Do not set `FLOODGUARD_DB_PATH` to an ephemeral filesystem and enable reporting.** Use a verified persistent disk with backups or migrate to managed PostgreSQL. Render plans and persistent-disk support vary; confirm eligibility before provisioning.
5. Keep `NIPOST_INTEGRATION_ENABLED=false` until official API behavior and sandbox credentials are tested privately. Never put the API key in `VITE_` variables.
6. After deployment visit `https://YOUR-RENDER-SERVICE/health` and `/api/v1/status`. Confirm reporting is disabled.

## Vercel
1. Import the same repository into Vercel, framework Vite, root directory repository root, build `npm run build`, output `dist`.
2. Set `VITE_FLOODGUARD_API_URL=https://YOUR-RENDER-SERVICE` and redeploy.
3. Verify home page, `/track` deep link, browser network requests, and CORS. Do not submit real incident reports until storage, privacy, and operator workflows are validated.

## Before public reporting
- Durable database and backups verified through restart/redeploy testing.
- Rate limiting at the edge; monitoring and incident-response ownership established.
- Privacy notice, retention policy, and consent reviewed.
- Test report receipt flow and deletion/retention controls.
- Only then set `FLOODGUARD_REPORTING_ENABLED=true` and redeploy.

## L2
L2 request is under review. No L2-only address or geolocation capabilities are enabled here.
