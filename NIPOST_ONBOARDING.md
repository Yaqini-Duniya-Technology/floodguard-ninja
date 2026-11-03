# NIPOST official integration — requirements before activation

1. Obtain written official developer documentation and permitted developer credentials. Never put secrets in chat, source files, screenshots or the frontend.
2. Confirm API host, lookup path, HTTP method, auth header format, rate limits, timeouts, error responses and terms of service.
3. Confirm postcode format; the current 11-character validation is provisional.
4. Confirm the actual response fields and whether building coordinates are supplied and licensed for flood analysis.
5. Implement adapter from the verified contract, mock it in tests, and validate against the official sandbox/production service with authorized credentials.
6. Verify geospatial accuracy, environmental evidence resolution, and user-facing warnings before presenting flood-risk output.
7. Keep `NIPOST_INTEGRATION_ENABLED=false` until the integration passes real provider acceptance tests.

To inspect configuration readiness locally (no NIPOST call):
`GET /api/v1/integrations/nipost/readiness`

The readiness endpoint intentionally never returns a key, configured URL or hostname and always reports live resolution unavailable until actual adapter implementation and verification.
