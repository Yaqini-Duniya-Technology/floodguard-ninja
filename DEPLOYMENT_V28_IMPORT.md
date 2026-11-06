# FloodGuard AI v2.8 — staged deployment import

This branch is a **staging branch**, not a production deployment. The v2.8 React/FastAPI application is available as a separate ZIP artifact in the ChatGPT conversation and must be imported as **source files**, not as a ZIP commit.

## Import checklist
1. Extract `FloodGuard_AI_v2.8_Deployment_Safety.zip`; copy the contents of its `FloodGuard_AI_v2.8/` directory into this branch's repository root.
2. **Do not commit** `.env`, API keys, `backend/floodguard.sqlite3`, `node_modules`, `__pycache__`, or generated build files.
3. Verify `backend/requirements.txt`, `backend/app/main.py`, `render.yaml`, `vercel.json`, `package.json`, and the frontend source are present.
4. Run `python -m pytest backend/tests` with dependencies installed, and `npm ci && npm run build`.
5. Review the changes and CI before merging. Preserve existing Dala Studio deployment.

## Deployment gate
- Render: use `backend` as root, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Keep `FLOODGUARD_REPORTING_ENABLED=false` until durable storage, backups, privacy, and operations are verified.
- Keep `NIPOST_INTEGRATION_ENABLED=false` until the L1 sandbox request is verified with a server-side test key.
- Configure CORS to the exact Vercel domain; keep NIPOST secrets server-side.
- Verify `/health`, `/api/v1/status`, frontend routes and CORS before enabling any public data collection.

**This PR alone does not import the v2.8 application or deploy it.**
