import { useState } from "react";
const base = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");
type Result = Record<string, unknown>;
export default function Intelligence() {
  const [lat, setLat] = useState(""), [lon, setLon] = useState("");
  const [data, setData] = useState<Record<string, Result>>({});
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  async function inspect() {
    setError(""); setData({});
    const latitude = Number(lat), longitude = Number(lon);
    if (!lat.trim() || !lon.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setError("Enter valid latitude and longitude coordinates."); return;
    }
    if (!base) { setError("FloodGuard backend URL is not configured."); return; }
    setBusy(true);
    const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    try {
      const r = await fetch(`${base}/api/v1/intelligence/overview?${query}`);
      if (!r.ok) throw new Error(`Location intelligence unavailable (${r.status})`);
      const overview = await r.json() as { services?: Record<string, Result> };
      setData(overview.services ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-4xl p-6 space-y-5">
    <h1 className="text-3xl font-bold">Location Intelligence</h1>
    <p>Explore sourced weather forecasts, operator-curated warning references and shelter listings. This is not an emergency dispatch service or an official flood warning feed.</p>
    <p className="text-sm font-semibold">Coordinates must be entered manually with the user's permission. Official NIPOST postcode resolution is not yet connected.</p>
    <div className="grid gap-3 sm:grid-cols-2"><label>Latitude<input className="w-full rounded border p-2 text-black" value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 9.0765" /></label>
    <label>Longitude<input className="w-full rounded border p-2 text-black" value={lon} onChange={e => setLon(e.target.value)} placeholder="e.g. 7.3986" /></label></div>
    <button className="rounded bg-blue-700 px-5 py-2 text-white disabled:opacity-50" disabled={busy} onClick={inspect}>{busy ? "Checking…" : "View location evidence"}</button>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {Object.entries(data).map(([name, result]) => <section key={name} className="rounded border p-4"><h2 className="text-xl font-semibold capitalize">{name}</h2><pre className="overflow-x-auto whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre></section>)}
    <p className="text-sm">In immediate danger, contact local emergency services. In Nigeria, dial 112 where available.</p>
  </main>;
}
