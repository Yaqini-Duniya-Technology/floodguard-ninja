import { useState } from "react";
import { Link } from "react-router-dom";
import { notices } from "@/lib/noticeCatalog";
export default function Alerts(){
 const [dismissed,setDismissed]=useState<string[]>([]);
 const visible=notices.filter(n=>!dismissed.includes(n.id));
 return <main className="max-w-3xl mx-auto px-4 py-12 space-y-5">
 <h1 className="text-3xl font-bold">Safety notices</h1>
 <p role="status" className="border rounded p-4">These are prewritten informational notices, not live flood warnings, push notifications, SMS messages or agency alerts. No messages have been sent to your device.</p>
 <div className="space-y-4">{visible.map(n=><article key={n.id} className="border rounded-lg p-5 space-y-2"><h2 className="text-xl font-semibold">{n.title}</h2><p>{n.body}</p><p className="text-sm text-muted-foreground">Source: {n.source}</p><button type="button" className="underline" onClick={()=>setDismissed(v=>[...v,n.id])}>Dismiss from this view</button></article>)}</div>
 {visible.length===0&&<p>All informational notices dismissed for this visit.</p>}
 <p><Link className="underline" to="/safety">Open the emergency safety guide</Link></p>
 </main>;
}
