# FloodGuard AI v2.5 — ten independently implemented L1-safe upgrades

Starting point: supplied v2.4 ZIP; original React/Vite frontend and backend retained.

1. API version increment to 2.5.0 with health verification.
2. Security response headers (nosniff, anti-framing, no-referrer, no-store).
3. Early request size limit (Content-Length > 16 KiB) for write requests. Note: a reverse proxy must enforce a real streamed-body limit as well.
4. Request correlation ID response header with sanitized inbound IDs.
5. Whitelisted CORS headers for receipt and idempotency flows.
6. Whitespace/control-character validation of report text and explicit format-only postcode normalization.
7. SQLite busy timeout, WAL mode and report timestamp index for local persistence.
8. One-time random receipt tokens stored as hashes and authenticated report status lookup (X-Report-Receipt header). Not an emergency dispatch service.
9. Optional Idempotency-Key for duplicate report prevention; conflicts return 409, and original receipt must be retained by caller. For production, add replay-safe receipt recovery and multi-process rate limiting.
10. Production mode disables interactive API documentation (`FLOODGUARD_ENV=production`).

## Verification
Run `PYTHONPATH=backend python -m pytest backend/tests -q`. 30 tests passed in this environment. No live NIPOST request was attempted. The NIPOST provider adapter deliberately fails closed until official API documentation is received.

## Deployment blockers
- Frontend build, browser QA and remote deployment have not been verified.
- Render ephemeral filesystem must not be used for real incident reports. Use durable managed storage before accepting real data.
- Per-process throttling is not distributed; put a gateway/edge rate limiter in front.
- The API does not dispatch emergency services; do not present it as a certified early-warning system.
- Receipt tokens are sensitive: do not put them in URLs, analytics, logs or public screenshots.
- Configure NIPOST key server-side only, and only after verifying official API contract.
- Complete data protection, retention, consent, operator access control, and operational procedures before public launch.
