# FloodGuard v2.8.1 — evidence, safety and NIPOST sandbox gates

## 1. Flood evidence
The Live Risk Map now requests `POST /api/v1/flood-risk/assess` for the Lokoja demonstration centre. The endpoint returns only operator-curated, source-linked observations from `FLOODGUARD_EVIDENCE_FILE` (JSON array) and defaults to `insufficient_data`, `risk_level: unknown` when no evidence is configured. It does not provide a calibrated flood probability, an evacuation decision or real-time alerts. No external feeds have been independently verified or installed in this change.

Each evidence record must contain `latitude`, `longitude`, `observed_at` (ISO date/time), `source_name`, `source_url`, `kind` (flood_observation, official_warning or flood_hazard_map), `summary`, and `radius_km`. Review source credibility, timestamp, location, rights and accuracy before configuring. Never interpret missing evidence as safety.

## 2. Public-safety controls
The Live Map displays a prominent demonstration notice. Risk percentages, weather values, shelters and routes are illustrative. Example routes must never be used for real evacuations. Additional demonstration content elsewhere in the app (including dashboard and homepage) still needs a product-wide safety audit before public launch.

## 3. NIPOST L1 sandbox
The existing `POST /api/v1/postcodes/resolve` is an L1 validity-only sandbox adapter. It intentionally refuses to run when `NIPOST_INTEGRATION_ENABLED=false`, when the key is absent, or when the key does not begin with `nipost_test_`. No key should be committed or exposed through Vite variables.

Check `GET /api/v1/integrations/nipost/readiness` for non-secret configuration status. It does NOT prove successful official verification. Keep `NIPOST_INTEGRATION_ENABLED=false` on staging until provider contract, test credentials and a private test lookup are confirmed. Do not infer geolocation, state or LGA from L1 results.

## Release gates
- Run backend pytest and frontend `npm ci && npm run build`.
- Confirm browser CORS permits the staging Vercel origin for POST assessment calls.
- Verify missing evidence produces a clearly visible unknown state.
- Verify NIPOST remains disabled and no secret is shipped in frontend bundles.
- Keep `FLOODGUARD_REPORTING_ENABLED=false` until durable storage and operational response processes are validated.
- Do not merge to `main` or promote production without review.
