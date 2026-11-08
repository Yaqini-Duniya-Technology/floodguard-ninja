import * as React from "react";
import { apiBase } from "@/lib/reportApi";

type Incident = { id: string; status: string; severity: string; type: string; timestamp: string; review_status: string };
type Audit = { report_id: string; kind: string; old_value: string | null; new_value: string; occurred_at: string };

export default function DemoReview() {
  const [operatorToken, setOperatorToken] = React.useState("");
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [events, setEvents] = React.useState<Audit[]>([]);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [selected, setSelected] = React.useState("");
  const [decision, setDecision] = React.useState("REVIEWED");
  const [note, setNote] = React.useState("");
  async function call(path: string, options: RequestInit = {}) {
    if (!apiBase) throw new Error("Backend API is not configured");
    const response = await fetch(`${apiBase}${path}`, {
      ...options, cache: "no-store",
      headers: { "X-Demo-Operator-Token": operatorToken, ...(options.body ? { "Content-Type": "application/json" } : {}) }
    });
    if (!response.ok) throw new Error(response.status === 403 ? "Operator access denied" : response.status === 503 ? "Demo operator access is disabled" : "Request failed");
    return response.json();
  }
  async function refresh() {
    setBusy(true); setError("");
    try {
      const [overview, audit] = await Promise.all([call("/api/v1/command-centre/overview"), call("/api/v1/operator/audit")]);
      setIncidents(overview.incidents); setEvents(audit.events);
    } catch (e) { setIncidents([]); setEvents([]); setError(e instanceof Error ? e.message : "Unable to load"); }
    finally { setBusy(false); }
  }
  async function review(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await call(`/api/v1/community/${encodeURIComponent(selected)}/review`, { method: "POST", body: JSON.stringify({ decision, note }) });
      setNote(""); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Review failed"); }
    finally { setBusy(false); }
  }
  return <main className="max-w-5xl mx-auto p-6 space-y-6">
    <h1 className="text-3xl font-bold">Restricted Demo Report Review</h1>
    <p role="note">Local demonstration only. No agency authentication, emergency dispatch, or public citizen reports. Operator token stays in this page's memory and is not stored in browser storage.</p>
    <label className="block">Demo operator token
      <input type="password" autoComplete="off" className="block border rounded p-3 w-full" value={operatorToken} onChange={e=>setOperatorToken(e.target.value)} />
    </label>
    <button className="rounded bg-blue-700 text-white p-3 disabled:opacity-50" disabled={busy || !operatorToken} onClick={refresh}>Load restricted reports</button>
    {error && <p role="alert" className="border rounded p-3">{error}</p>}
    <section><h2 className="text-xl font-semibold mb-3">Pending and reviewed reports (redacted)</h2>
      <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr><th>Reference</th><th>Status</th><th>Severity</th><th>Review</th><th>Action</th></tr></thead><tbody>{incidents.map(x=><tr key={x.id} className="border-t"><td className="p-2 font-mono text-xs">{x.id}</td><td>{x.status}</td><td>{x.severity}</td><td>{x.review_status}</td><td><button className="underline" onClick={()=>setSelected(x.id)}>Select</button></td></tr>)}</tbody></table></div>
    </section>
    {selected && <form onSubmit={review} className="border rounded p-4 space-y-3"><h2 className="font-semibold">Review selected report</h2><p className="text-xs break-all">{selected}</p>
      <select className="border rounded p-2" value={decision} onChange={e=>setDecision(e.target.value)}><option>REVIEWED</option><option>NEEDS_MORE_EVIDENCE</option><option>UNVERIFIED</option><option>REJECTED</option></select>
      <label className="block">Private review note (not displayed in audit)<textarea className="block w-full border rounded p-2" maxLength={500} value={note} onChange={e=>setNote(e.target.value)} /></label>
      <button className="rounded bg-blue-700 text-white p-2" disabled={busy}>Save demo review</button>
    </form>}
    <section><h2 className="text-xl font-semibold">Redacted audit events</h2><p className="text-sm">Locations, descriptions, private notes and receipt credentials are excluded.</p>
      <ul className="space-y-2 mt-3">{events.map((x,i)=><li key={i} className="border rounded p-2 text-sm break-all">{x.occurred_at} — {x.kind}: {x.old_value || "—"} → {x.new_value} ({x.report_id})</li>)}</ul>
    </section>
  </main>;
}
