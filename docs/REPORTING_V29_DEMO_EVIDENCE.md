# FloodGuard AI — reporting reliability and evidence checklist

**Developed by Yaqini & Duniya Technology.** Local prototype only; no connected emergency dispatch.

## Before recording
- Use a local test database and fictional descriptions; never expose receipt tokens, API keys or real citizen addresses.
- Set `FLOODGUARD_ENV=test`, `FLOODGUARD_DEMO_OPERATOR_TOKEN` (at least 24 characters) and the local backend URL. Never put the operator token in the public Vite environment.
- Run `cd backend; python -m pytest -q` and `npm.cmd run build` from the frontend root.
- Record actual command outputs, dates and commit SHA; do not claim unexecuted tests passed.

## Demonstration and screenshot sequence
1. **Postcode verification**: show NIPOST L1 test response; clearly state validity only, and document the dashboard/API discrepancy.
2. **Fallback**: enter fictional location; continue to reporting and show the prefilled, editable user-reported location.
3. **Submission**: create a marked TEST report on local backend. Screenshot success with private receipt token **hidden**.
4. **Tracking**: use private token without recording it; show PENDING and 'Emergency dispatch: Not connected'.
5. **Demo operator review**: show restricted command centre, masked/redacted incident list and review action. Do not claim government/agency authentication.
6. **Audit**: show status transition and redacted audit events; verify private notes and locations are absent.
7. **Receipt rotation**: rotate a test receipt; demonstrate old token rejected and new token accepted, without recording either.
8. **Negative cases**: missing/wrong receipt -> 404; missing operator token -> 403; production environment -> operator disabled.

## Acceptance
- [ ] Automated backend suite passes locally or CI; attach output
- [ ] Frontend build passes; attach output
- [ ] Manual browser flow passes
- [ ] No real user location, secrets, or receipts in screenshots/logs
- [ ] No live NIPOST validity guarantee or emergency dispatch claim
- [ ] Review and approval before any merge or deployment

## Known limits
- Demo operator shared secret is **not production-grade user authentication**; no production operator access.
- Rate limiting is per process and must be enforced at the edge for production.
- Local SQLite persistence must not be assumed durable on hosted ephemeral disks.
- Receipt tokens are bearer credentials; rotation revokes the old token, but cannot retract data already seen by someone who possessed it.
- The current public dashboard contains illustrative/demo figures that must be labelled clearly before external demonstration.
