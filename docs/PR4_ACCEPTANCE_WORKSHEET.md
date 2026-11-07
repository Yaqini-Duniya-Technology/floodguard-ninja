# FloodGuard AI — acceptance and approval worksheet

**Target:** PR #4 from `feature/fga-batch1-emergency-safety` into `feature/v2.9-evidence-intelligence`. Never merge into `main` or deploy as part of this review.

## A. NIPOST authorised Level 1 sandbox integration
- [ ] Confirm developer dashboard authorisation and L1 access. L2/L3 must not be assumed.
- [ ] Compare `backend/app/postcode.py` base URL, `/v1/lookup` path, HTTP method, `code`/`level` query parameters, API-key header and response `data.valid` schema with **current official docs**. Current code is an adapter assumption, not independently validated.
- [ ] In an isolated **non-production** backend, configure `NIPOST_INTEGRATION_ENABLED=true` and `NIPOST_API_KEY` using an approved sandbox key via environment variables. Do not paste the key into chat, GitHub or frontend env.
- [ ] Test an officially supplied valid test postcode, an invalid test postcode, missing credentials, unauthorised key, provider outage and rate limiting. Record only redacted status codes and expected behaviour.
- [ ] Ensure L1 response never exposes address, coordinates or inferred flood safety.
- [ ] If no documented sandbox API/key is available, mark **BLOCKED — EXTERNAL DEPENDENCY**; demo must show graceful unavailable state, not fabricated verification.

## B. Browser and mobile acceptance
Use a local frontend/backend or isolated preview environment. Do **not** change existing production deployment.
- [ ] Open /demo on desktop Chrome and mobile viewport (e.g. 390 × 844), verify headings, layout, navigation and checklist.
- [ ] Open /safety with network disabled; verify bundled guidance is readable.
- [ ] Open /postcode with integration disabled; verify honest error and no secret exposed in browser.
- [ ] Open /intelligence; verify source, timestamps and no unsupported flood-risk classification.
- [ ] Submit a clearly fictional report on a test database; capture private receipt only locally. Verify /track with valid receipt, wrong receipt and unknown report.
- [ ] Confirm /plans contains no payment or checkout and distinguishes proposed tiers.
- [ ] Confirm /sms, /ussd and /whatsapp make no claim of live provider connectivity.
- [ ] Confirm no real emergency dispatch, government affiliation or validated flood prediction is asserted.
- [ ] Inspect browser console/network for errors and check keyboard focus and mobile overflow.
- [ ] Remove test data and secrets after review.

## C. Security sign-off
- [ ] Confirm `FLOODGUARD_ENV` must be explicitly `test` or `demo` for demo operator routes.
- [ ] Verify unauthorised requests and production-mode operator requests are rejected.
- [ ] Verify community/command-centre/analytics responses contain no citizen address or narrative.
- [ ] Check deployment secrets, logs, CORS origins, persistent database storage and retention policy.
- [ ] Record reviewer name, date, scope and findings; resolve any high-severity finding.

## D. PR approval and controlled merge
- [x] Latest observed GitHub Actions runs for `ff94573cd7662d7773ea89b0e0e641cf1bd89c51`: 42389428671 and 42389428672, both successful.
- [ ] Fresh CI for the **final** head commit is green.
- [ ] Independent reviewer or repository owner inspects Files changed and this worksheet; no GitHub review submitted yet.
- [ ] Explicitly approve PR #4 into `feature/v2.9-evidence-intelligence` only.
- [ ] Record source/target SHA and confirm no drift/conflicts immediately before merge.
- [ ] Merge PR #4 only after explicit owner authorisation. No auto-deployment.
- [ ] Confirm `main` and existing production deployments remain untouched.

**Decision:** BLOCKED pending external NIPOST contract verification, manual acceptance and review approval. Automated CI success is necessary but insufficient.
