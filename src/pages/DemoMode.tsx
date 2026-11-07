import { Link } from "react-router-dom";
import { useState } from "react";

const steps = [
 {title:"1. Validate a digital postcode",path:"/postcode",action:"Open postcode verification",detail:"Check a permitted NIPOST Level 1 sandbox postcode. This does not confirm an address or flood safety.",dependency:"Requires configured authorised NIPOST test access."},
 {title:"2. Inspect weather evidence",path:"/intelligence",action:"Open intelligence",detail:"Inspect source-linked rainfall context. Weather alone is not a verified flood-risk prediction.",dependency:"Forecast retrieval may require a working weather provider."},
 {title:"3. Submit a community observation",path:"/report",action:"Open report form",detail:"Submit only a clearly fictional test incident in a non-production environment. Save its receipt token privately.",dependency:"Requires a working backend and report intake enabled."},
 {title:"4. Review immediate safety guidance",path:"/safety",action:"Open safety guide",detail:"Use bundled guidance that does not depend on AI or mobile-network messaging.",dependency:"General guidance; not an emergency dispatch service."},
 {title:"5. Track the report",path:"/track",action:"Open private tracking",detail:"Enter the report ID and receipt token from step 3. Internal status is not an official agency acknowledgement.",dependency:"Requires a previously created report and its private receipt."},
 {title:"6. Explain the business model",path:"/plans",action:"Open service model",detail:"Explain free citizen guidance and proposed institutional offerings without claiming active payments.",dependency:"Commercial services are proposals only."}
];
export default function DemoMode(){
 const [completed,setCompleted]=useState<number[]>([]);
 const toggle=(i:number)=>setCompleted(current=>current.includes(i)?current.filter(n=>n!==i):[...current,i]);
 return <main className="mx-auto max-w-4xl px-4 py-12 space-y-6">
 <header className="space-y-3"><p className="text-sm font-semibold uppercase tracking-wide">NIPOST showcase walkthrough • Demonstration only</p><h1 className="text-3xl font-bold">FloodGuard AI — Guided Demo</h1>
 <p>Developed by Yaqini & Duniya Technology</p>
 <p role="alert" className="rounded-lg border p-4">No real emergency response, rescue dispatch, SMS, WhatsApp, USSD or verified flood prediction is activated by this walkthrough. Do not submit real emergencies as demo data.</p></header>
 <section className="rounded-lg border p-4" aria-live="polite"><h2 className="font-semibold">Presentation checklist</h2><p>{completed.length} of {steps.length} steps marked complete on this screen. This does not verify backend connectivity or feature success.</p></section>
 <ol className="space-y-4">{steps.map((step,i)=><li key={step.path} className="rounded-lg border p-5 space-y-3">
 <h2 className="text-lg font-semibold">{step.title}</h2><p>{step.detail}</p><p className="text-sm text-muted-foreground">{step.dependency}</p>
 <div className="flex flex-wrap gap-4 items-center"><Link className="underline font-medium" to={step.path}>{step.action}</Link>
 <label className="flex items-center gap-2"><input type="checkbox" checked={completed.includes(i)} onChange={()=>toggle(i)}/> Presenter marked complete</label></div></li>)}</ol>
 <section className="border rounded-lg p-5 space-y-2"><h2 className="text-lg font-semibold">Questions judges may ask</h2>
 <p><strong>Why no smartwatch?</strong> Core guidance and reporting are designed for phones and browsers; no wearable purchase is required.</p>
 <p><strong>What if rescue is delayed?</strong> Show immediate safety guidance and private status tracking. Do not promise responder dispatch or survival outcomes.</p>
 <p><strong>Who pays?</strong> General citizen safety guidance is free; institutional intelligence and integrations are proposed commercial services.</p></section>
 </main>;
}
