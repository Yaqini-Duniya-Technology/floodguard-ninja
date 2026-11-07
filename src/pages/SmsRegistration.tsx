import { Link } from "react-router-dom";
/** No personal-data collection until a verified provider and consent workflow exist. */
export default function SmsRegistration() {
 return <main className="mx-auto max-w-2xl px-4 py-16 space-y-5">
 <h1 className="text-3xl font-bold">SMS flood alerts — not yet available</h1>
 <p role="status" className="rounded border p-4">FloodGuard does not currently send SMS warnings or accept SMS subscriptions. No phone number or personal information is collected on this page.</p>
 <p>Future SMS support will require a contracted provider, explicit consent, delivery-status monitoring, opt-out controls and documented data retention.</p>
 <p>Until a verified service is available, follow official emergency warnings and contact local emergency services when in immediate danger.</p>
 <Link to="/alerts" className="underline">View in-app safety notices</Link>
 </main>;
}
