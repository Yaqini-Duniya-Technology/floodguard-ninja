# FloodGuard AI — Phase 1 safety patch

Preserved the original Dala Studio React/Vite application and design.

## Changes
- Removed unsupported chatbot claims of live low/moderate flood risk for particular locations.
- Replaced an unverified emergency contact claim with guidance to verify local contacts.
- Changed emergency call number from 911 to Nigeria emergency number 112.
- Emergency call action now opens the device dialler via `tel:112` instead of only showing a success toast.
- Clarified that the application cannot confirm a call connected or emergency help was dispatched.
- Clarified that the location-sharing button does not transmit coordinates.

## Still needed
- Verify all dashboard/map/demo risk data and label accordingly.
- Connect verified emergency service and flood data sources.
- Install dependencies and run production build on an environment with npm access.
- Confirm official NIPOST API contract and credentials before implementing live lookup.

No claim is made that emergency calls are completed by the application.
