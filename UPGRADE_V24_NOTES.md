# FloodGuard AI v2.4 — deployment and L1 readiness

## Changes
- Accept official display format `AD-04-C09-UH-20` by stripping display separators before the 11-character check. Format validation does **not** prove existence.
- Add Vercel SPA rewrites and Render FastAPI blueprint.
- Add separate example environment configurations and postcode-format regression tests.
- Preserve existing UI and incident reporting.

## Critical limitations
- Official NIPOST API request URL, HTTP method, auth header, and response contract are **not verified**. The adapter intentionally returns 503 rather than inventing verification.
- L1 is validity-only; no address/coordinates. L2 is under review and CAC verification remains incomplete.
- `render.yaml` is deployment scaffolding, not evidence of live deployment. SQLite must be on persistent storage or replaced with managed DB.
- Do not expose API secrets in Vite/React environment variables.
- No emergency dispatch is connected; no validated flood prediction.

## To deploy
1. Push the project to a private repository after checking for secrets.
2. Deploy frontend via Vercel with Vite framework; set API URL as required by the existing frontend's actual configuration.
3. Deploy backend via Render blueprint; set allowed frontend origin. Provision durable database storage before collecting real reports.
4. Run backend tests and frontend build; verify CORS and reports end-to-end before public use.
5. Obtain NIPOST API reference from authorised support and implement the provider adapter using a documented contract.

## Official access rules
L1 returns validity only. Never derive a user's precise location from postcode format or from an L1 validity response. Collect coordinates separately with informed consent, or await an approved higher-level service that explicitly supplies them.
