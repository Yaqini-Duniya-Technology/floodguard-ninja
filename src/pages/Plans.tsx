import { useEffect, useState } from "react";
type Plan={id:string;name:string;audience:string;pricing:string;price_ngn:number|null;features:string[];availability:string};
const fallback:Plan[]=[
 {id:"citizen",name:"Citizen Safety",audience:"Residents and households",pricing:"free",price_ngn:0,features:["Emergency safety guidance","Community reporting where available","Private report tracking"],availability:"Prototype services"},
 {id:"institution",name:"Institutional Intelligence",audience:"Schools, NGOs, local authorities and businesses",pricing:"quotation_required",price_ngn:null,features:["Incident monitoring concept","Community review workflow","Analytics roadmap"],availability:"Pilot proposal only"},
 {id:"enterprise",name:"Enterprise / Government Integration",audience:"Government agencies and larger organisations",pricing:"quotation_required",price_ngn:null,features:["Integration scoping","Security assessment","Negotiated service agreements"],availability:"Proposal only"}
];
export default function Plans(){
 const [plans,setPlans]=useState<Plan[]>(fallback);
 const [status,setStatus]=useState("Illustrative plans; no payment or subscriptions available.");
 useEffect(()=>{
  const base=import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/,"");
  if(!base)return;
  const controller=new AbortController();
  fetch(`${base}/api/v1/commercial/plans`,{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error("unavailable");return r.json()}).then(data=>{if(Array.isArray(data.plans))setPlans(data.plans);setStatus(data.disclaimer??status)}).catch(()=>{});
  return ()=>controller.abort();
 },[]);
 return <main className="mx-auto max-w-5xl px-4 py-12 space-y-6">
 <h1 className="text-3xl font-bold">FloodGuard AI — Service Model</h1>
 <p>Essential safety guidance remains free. Institutional offerings are proposed pilots, not active paid services.</p>
 <p role="status" className="rounded border p-4">{status}</p>
 <div className="grid gap-5 md:grid-cols-3">{plans.map(plan=><section key={plan.id} className="rounded-lg border p-5 space-y-3">
 <h2 className="text-xl font-bold">{plan.name}</h2><p>{plan.audience}</p><p className="font-semibold">{plan.pricing==="free"?"Free": "Price by quotation — not available for purchase"}</p>
 <ul className="list-disc pl-5 space-y-2">{plan.features.map(f=><li key={f}>{f}</li>)}</ul><p className="text-sm">Status: {plan.availability}</p>
 </section>)}</div>
 <p className="text-sm">No checkout is available. FloodGuard AI is not an official emergency dispatch provider.</p>
 </main>;
}
