# Deployment readiness (development only)

1. Configure `FLOODGUARD_ALLOWED_ORIGINS` to the exact HTTPS frontend origin.
2. Configure `FLOODGUARD_DB_PATH` to a persistent writable volume; SQLite on ephemeral hosting loses reports.
3. Run `pip install -r requirements.txt` and `uvicorn app.main:app --host 0.0.0.0 --port 8000` from `backend/`.
4. Set `VITE_FLOODGUARD_API_URL` at frontend build time to the deployed API HTTPS origin.
5. Run `pytest -q` and `npm run build` before deployment.
6. Put a gateway/WAF rate limiter in front of the service; the built-in per-process limiter is not distributed.
7. Do not enable NIPOST integration until the real provider contract and permission are verified.
8. Never advertise automatic emergency dispatch, verified flood forecasts, or official alerts without operational integration.
9. Use managed persistent storage, backups, HTTPS, monitoring, and incident response processes before public launch.
