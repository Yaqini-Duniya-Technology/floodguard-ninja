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
