# FloodGuard AI — Five incremental upgrades (v2.3 development package)

13. **Operational status**: `/api/v1/status` explicitly discloses unavailable dispatch, NIPOST verification and validated flood prediction.
14. **Reporting abuse throttle**: best-effort per-process 10 reports/minute/IP, returning HTTP 429; not a substitute for an edge limiter.
15. **Postcode-aware reports**: optional unverified postcode saved in a separate SQLite table, without altering existing report table layout. No false geolocation claims.
16. **Report receipt**: frontend displays unique submission reference after server confirmation.
17. **Deployment and regression preparation**: deployment guide, regression tests, updated API version and verification steps.

This is a development build. NIPOST API remains disconnected. No emergency dispatch is performed. Frontend build must be independently verified.
