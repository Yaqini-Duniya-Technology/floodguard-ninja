# FloodGuard AI — Batch 1 release gate (7 November 2026)

## Automated evidence
- Commit `159e2a3aa0db28037bb2239b05d06ec550d0d909`:
  - GitHub Actions run 42388179104: Batch 1 Quality Gate — success.
  - Backend tests: **50 passed, 1 warning** (TestClient/httpx deprecation).
  - Frontend TypeScript and Vite build — success.
  - GitHub Actions run 42388179053: FloodGuard QA — success.
- These results cover the tested commit only. Subsequent changes must rerun the gate.

## Before demo
- [ ] Verify /demo, /postcode, /intelligence, /report, /track, /safety and /plans manually on mobile and desktop.
- [ ] Confirm that sandbox postcode provider URL and contract match the latest official NIPOST documentation. Do not use L2 without approval.
- [ ] Confirm that only fictional test reports are used for demonstration and delete test data after the showcase.
- [ ] Confirm production FLOODGUARD_REPORTING_ENABLED is false unless durable storage and human monitoring exist.
- [ ] Confirm no demo operator token is deployed to production or exposed in browser bundles.
- [ ] Confirm demo workflows are disabled in production and no claims of live dispatch, SMS, USSD, WhatsApp or validated flood predictions appear.
- [ ] Conduct security review, privacy and data-retention review, accessibility review, and manual acceptance testing.
- [ ] Obtain explicit approval before merge or deployment.

## Known limitations
- Demo operator shared token is not a production identity/authorisation system.
- Government command centre is a prototype, not agency-connected.
- Community reports are unverified and are not public warnings.
- Commercial tiers are proposals; no payment or active subscriptions.
- Automated tests and builds do not validate live emergency response or external service integration.

## Security review update — 7 November 2026
- Reviewed demo operator guard: now requires FLOODGUARD_ENV=test or demo explicitly; absent, staging, development and production environments fail closed.
- Incident transition updates now reject stale concurrent status changes.
- Added regression test for fail-closed operator access.
- Source inspection confirms demo walkthrough has explicit disclaimers, links to real routes and no simulated agency acknowledgement.
- The NIPOST L1 adapter uses a fixed provider URL, test-key-only guard and discards address/coordinate fields, but the external provider contract has not been verified against live documentation.
- Review of source and CI does **not** constitute penetration testing, live integration verification or manual browser acceptance.
- This branch is not ready to merge until fresh CI passes after these changes and human review confirms the demo.
