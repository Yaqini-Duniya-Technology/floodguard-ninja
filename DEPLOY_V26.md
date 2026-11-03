# FloodGuard AI v2.6 deployment checklist

## Backend (Render)
Deploy repository using `render.yaml` or create Python web service rooted at `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
**Do not deploy public reporting without durable storage.** Configure a persistent disk mounted at `/var/data` and `FLOODGUARD_DB_PATH=/var/data/floodguard.sqlite3` if your Render service plan supports persistent disks, or migrate to managed PostgreSQL first. The sample `render.yaml` does not provision a disk. Render instances with ephemeral storage lose SQLite reports on redeploy/restart.
Set `FLOODGUARD_ALLOWED_ORIGINS=https://<your-vercel-domain>` (no trailing slash), `FLOODGUARD_ENV=production`, `NIPOST_INTEGRATION_ENABLED=false`. Never put the NIPOST key in frontend variables or git.
Check `/health` and `/api/v1/status`. The latter is a capability disclosure, not an assurance of live flood prediction.

## Frontend (Vercel)
Import same repository, root directory project root, framework Vite, build `npm run build`, output `dist`. Set `VITE_FLOODGUARD_API_URL=https://<your-render-api-domain>` and redeploy after adding variable. `vercel.json` handles SPA routes.

## Verification
1. Confirm both HTTPS health endpoints and correct CORS origin.
2. Submit a **synthetic test report** from `/report`, securely save the displayed reference and token.
3. Check `/track` using both values; verify invalid token fails.
4. Verify report persists after backend restart. If not, do not accept public reports.
5. Test phone-sized layout and keyboard access.
6. Keep NIPOST disabled until official endpoint, auth and response contract are documented and tested. L1 must never imply address or coordinates.
7. Do not represent sample maps, demo weather, dashboard counts or flood risk as official live intelligence unless verified.
