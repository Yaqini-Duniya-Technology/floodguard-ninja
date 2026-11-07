import { useState } from "react";
import { Link } from "react-router-dom";
const scenarios = [
 {id:"rising-water",title:"Water rising nearby",steps:["Move to higher ground if you can do so without entering floodwater.","Keep children and vulnerable people with you.","Avoid flooded roads, drains and bridges.","Contact official emergency services when in immediate danger."]},
 {id:"trapped",title:"Trapped in a flooded building",steps:["Move to a higher level if safe; avoid enclosed attics without an escape route.","Do not enter moving floodwater or attempt to swim out.","Signal your location to responders using a phone, light or visible cloth if safe.","Conserve battery power and follow instructions from verified emergency responders."]},
 {id:"driving",title:"Flooded road ahead",steps:["Do not drive or walk through floodwater.","Turn around and choose a safe, dry route if possible.","If stranded, contact official emergency services and follow their instructions.","Avoid touching electrical equipment or fallen power lines."]},
 {id:"preparation",title:"Prepare before flooding",steps:["Monitor official weather and emergency warnings.","Prepare drinking water, essential medication, documents and a charged phone.","Identify a safe higher-ground meeting place with your household.","Follow official evacuation instructions promptly."]}
];
export default function EmergencySafety(){
 const [selected,setSelected]=useState(scenarios[0].id);
 const current=scenarios.find(s=>s.id===selected)!;
 return <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
 <h1 className="text-3xl font-bold">Flood Emergency Safety Guide</h1>
 <p role="alert" className="border rounded p-4">If you are in immediate danger, contact official emergency services. FloodGuard AI does not dispatch responders or confirm that a rescue team has received your report.</p>
 <p>This guide is available without an AI connection. It provides general preparedness information, not verified live evacuation routes.</p>
 <label className="block font-semibold" htmlFor="scenario">Choose your situation</label>
 <select id="scenario" className="w-full border rounded p-3 text-foreground bg-background" value={selected} onChange={e=>setSelected(e.target.value)}>{scenarios.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
 <section aria-live="polite" className="border rounded p-5 space-y-4"><h2 className="text-xl font-bold">{current.title}</h2><ol className="list-decimal pl-6 space-y-3">{current.steps.map(step=><li key={step}>{step}</li>)}</ol></section>
 <p><Link className="underline" to="/report">Record a flood report</Link> — reporting in FloodGuard AI is not the same as notifying an emergency agency.</p>
 <p><Link className="underline" to="/track">Track an existing report</Link></p>
 </main>;
}
