# FloodGuard AI v1.9 — Five incremental upgrades

1. **Weather forecast adapter**: Open-Meteo 3-day rainfall and probability data; explicit non-warning disclaimer, timeouts, upstream failure handling.
2. **Curated warning references**: Nearby operator-supplied `official_warning` evidence with source and date, never advertised as comprehensive live alerts.
3. **Verified-source shelter directory**: Optional operator-maintained JSON, location search, distance and source provenance; no fabricated shelters.
4. **Operational capability endpoint**: `/api/v1/intelligence/status` declares exactly which services are and are not configured.
5. **Location intelligence frontend**: New `/intelligence` page with manual consent-based coordinates, forecast, warnings and shelters; no fabricated postcode resolution.

## Critical limits
- NIPOST API remains unconnected pending official contract and credentials.
- Forecast precipitation is not a validated flood risk score.
- Alerts are not a live government warning feed.
- No emergency dispatch or verified live shelter capacity.
- Deploy backend and configure `VITE_FLOODGUARD_API_URL` for the page to work.
- Do not put API secrets into frontend environment variables.
