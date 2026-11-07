# FloodGuard AI — Batch 1 emergency safety foundation

This branch builds on feature/v2.9-evidence-intelligence, not main.

## FGA-001 — Emergency Survival Assistant
- New frontend route: /safety
- New backend routes: GET /api/v1/safety/scenarios and GET /api/v1/safety/scenarios/{scenario_id}
- Deterministic general guidance for rising water, trapped occupants, flooded roads and preparedness.
- No AI provider, external API, live location data or emergency dispatch is required.
- The frontend includes an offline-bundled copy of guidance for resilience; changes must update both copies until a versioned sync/cache mechanism exists.

## FGA-002 — Emergency Response Tracking audit
Existing /api/v1/reports/{report_id}/status is private receipt-token protected and reports dispatch:not_connected.
The status is currently PENDING only. Do not represent it as official agency acknowledgement.
Full role-based status transitions and audited agency actions remain unimplemented and require authentication design.

## Safety limitations
General guidance only; verify with local emergency authorities before public safety deployment.
Do not claim live SOS dispatch, agency partnerships, evacuation routes or guaranteed rescue.
Production reporting remains disabled unless explicitly enabled and durable storage is configured.

## Verification
Run from repository root:
cd backend
python -m pytest tests/test_safety.py -q
cd ..
npm ci
npm run build

Tests and build are not yet verified in this change.

## FGA-002 — Demo-only status workflow (added)
- POST /api/v1/incidents/{report_id}/transitions
  - Header: X-Demo-Operator-Token (configured by FLOODGUARD_DEMO_OPERATOR_TOKEN; minimum 24 characters).
  - Disabled when FLOODGUARD_ENV=production.
  - Allowed transitions: PENDING → ACKNOWLEDGED → ASSIGNED → RESPONDING → RESOLVED, plus configured ESCALATED/CANCELLED paths.
  - All updates are simulated, not verified responder actions.
- GET /api/v1/incidents/{report_id}/timeline
  - Header: X-Report-Receipt (private token from report creation).
  - Returns timestamped status changes without exposing the operator note.
- Tests: backend/tests/test_incidents.py.
- The demonstration operator token is not a replacement for real institutional RBAC, MFA or a responder integration. Never enable this workflow for public production use.

### PowerShell verification
```powershell
git fetch origin
git switch feature/fga-batch1-emergency-safety
cd backend
python -m pip install -r requirements.txt
python -m pytest tests/test_safety.py tests/test_incidents.py tests/test_reports.py -q
cd ..
npm ci
npm run build
```
