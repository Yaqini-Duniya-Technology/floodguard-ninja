import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const api = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");
type ReferenceItem = { code?: string; name?: string; state_code?: string; lga_code?: string; district_code?: string; area_code?: string; label?: string };
type Assembly = { postcode: string; display?: string; compact?: string; verification_status: string; verified_building: boolean };
type Verification = { postcode: string; status: string; state: string | null; lga: string | null; latitude: number | null; longitude: number | null; source: string };
export default function PostcodeVerification() {
 const [postcode,setPostcode]=useState("");
 const [refs,setRefs]=useState<Record<string,ReferenceItem[]>>({});
 const [selected,setSelected]=useState<Record<string,string>>({state:"",lga:"",district:"",area:"",unit:""});
 const [assembly,setAssembly]=useState<Assembly|null>(null);
 const [referenceError,setReferenceError]=useState("");
 const [referenceBusy,setReferenceBusy]=useState(false);
 const levels=["state","lga","district","area"] as const;
 const segments=["state","lga","district","area","unit"] as const;
 useEffect(()=>{
  if(!api){setReferenceError("Backend API is not configured.");return;}
  const controller=new AbortController();
  const level=!selected.state?"state":!selected.lga?"lga":!selected.district?"district":"area";
  const qs=new URLSearchParams();
  if(level!=="state") qs.set("state",selected.state);
  if(level==="district"||level==="area") qs.set("lga",selected.lga);
  if(level==="area") qs.set("district",selected.district);
  setReferenceBusy(true);setReferenceError("");
  fetch(`${api}/api/v1/postcodes/reference/${level==="state"?"states":level==="lga"?"lgas":level==="district"?"districts":"areas"}${qs.size?"?"+qs:""}`,{signal:controller.signal})
   .then(async r=>{if(!r.ok)throw new Error("NIPOST reference data is unavailable. Check sandbox configuration.");return r.json();})
   .then(data=>{if(!controller.signal.aborted)setRefs(prev=>({...prev,[level]:Array.isArray(data[level==="state"?"states":level==="lga"?"lgas":level==="district"?"districts":"areas"])?data[level==="state"?"states":level==="lga"?"lgas":level==="district"?"districts":"areas"]:[]}));})
   .catch(err=>{if(!controller.signal.aborted)setReferenceError(err instanceof Error?err.message:"Reference data unavailable.");})
   .finally(()=>{if(!controller.signal.aborted)setReferenceBusy(false);});
  return ()=>controller.abort();
 },[selected.state,selected.lga,selected.district]);
 function changeSegment(level:string,value:string){
  setSelected(prev=>{const next={...prev,[level]:value};const index=segments.indexOf(level as typeof segments[number]);for(const downstream of segments.slice(index+1))next[downstream]="";return next;});
  setAssembly(null);
 }
 async function assemble(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setAssembly(null);setReferenceError("");
  if(!api){setReferenceError("Backend API is not configured.");return;}
  if(!segments.every(k=>selected[k])){setReferenceError("Complete all postcode segments.");return;}
  setReferenceBusy(true);
  try{
   const r=await fetch(`${api}/api/v1/postcodes/assemble`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(selected)});
   if(!r.ok){const body=await r.json().catch(()=>({}));throw new Error(typeof body.detail==="string"?body.detail:"Assembly unavailable.");}
   const data=await r.json() as Assembly;setAssembly(data);setPostcode(data.postcode);
  }catch(err){setReferenceError(err instanceof Error?err.message:"Assembly unavailable.");}finally{setReferenceBusy(false);}
 }
 const [result,setResult]=useState<Verification|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [manualLocation,setManualLocation]=useState("");
 async function verify(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();setResult(null);setError("");
  const normalized=postcode.toUpperCase().replace(/[ -]/g,"");
  if(!/^[A-Z]{2}[0-9]{2}[A-Z][0-9]{2}[A-Z]{2}[0-9]{2}$/.test(normalized)){setError("Enter an 11-character digital postcode in the expected format.");return;}
  if(!api){setError("Backend API is not configured.");return;}
  setBusy(true);
  try {
   const response=await fetch(`${api}/api/v1/postcodes/resolve`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postcode:normalized})});
   if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(typeof body.detail==="string"?body.detail:"Postcode verification unavailable.");}
   setResult(await response.json() as Verification);
  }catch(err){setError(err instanceof Error?err.message:"Verification unavailable.");}finally{setBusy(false);}
 }
 return <main className="mx-auto max-w-3xl p-6 space-y-5">
 <h1 className="text-3xl font-bold">NIPOST Digital Postcode Verification</h1>
 <p>This integration is restricted to authorised Level 1 sandbox validity checks. It does not provide a verified street address, coordinates, flood-risk rating or emergency response location.</p>
 <section className="rounded border p-5 space-y-3" aria-labelledby="assembly-title">
 <h2 id="assembly-title" className="text-xl font-semibold">Assemble a digital postcode (sandbox)</h2>
 <p>Choose official administrative segments. Assembly creates a formatted postcode; it does not verify a building, address, flood risk or emergency location.</p>
 <form onSubmit={assemble} className="space-y-3">
 {levels.map((level,index)=><label key={level} className="block font-medium">{level.toUpperCase()}
 <select className="mt-1 w-full rounded border p-3 text-black" value={selected[level]} disabled={referenceBusy||(index>0&&!selected[levels[index-1]])} onChange={e=>changeSegment(level,e.target.value)}>
 <option value="">Select {level}</option>
 {(refs[level]||[]).map((item,i)=>{const code=String(item.code||item[`${level}_code` as keyof ReferenceItem]||"");return <option key={code||i} value={code} disabled={!code}>{item.name||item.label||code} ({code})</option>;})}
 </select></label>)}
 <label className="block font-medium">Unit code (two digits)
 <input className="mt-1 w-full rounded border p-3 text-black" value={selected.unit} onChange={e=>changeSegment("unit",e.target.value.replace(/\\D/g,"").slice(0,2))} maxLength={2} inputMode="numeric" placeholder="27" /></label>
 <button className="rounded bg-blue-700 px-5 py-3 text-white disabled:opacity-50" disabled={referenceBusy||!segments.every(k=>selected[k])}> {referenceBusy?"Loading…":"Assemble postcode"} </button>
 </form>
 {referenceError&&<p role="alert" className="rounded border border-amber-500 p-3">{referenceError}</p>}
 {assembly&&<div aria-live="polite" className="rounded border p-3"><p className="font-semibold">Assembled: {assembly.postcode}</p><p>Building verification: Not verified</p><p>Use the separate validity check only when the NIPOST sandbox lookup is reliable.</p></div>}
 </section>
 <form onSubmit={verify} className="space-y-3"><label htmlFor="postcode" className="block font-semibold">Digital postcode</label><input id="postcode" value={postcode} onChange={e=>setPostcode(e.target.value)} maxLength={40} autoComplete="off" placeholder="SS-LL-PDD-AA-DD" className="w-full border rounded p-3 text-black" /><button type="submit" disabled={busy} className="rounded bg-blue-700 px-5 py-3 text-white disabled:opacity-50">{busy?"Verifying…":"Verify postcode validity"}</button></form>
 {error&&<p role="alert" className="rounded border p-3">{error}</p>}
 {result&&<section aria-live="polite" className="border rounded p-5 space-y-2"><h2 className="font-semibold">Level 1 result</h2><p>Postcode: {result.postcode}</p><p>Validity: {result.status==="verified"?"Confirmed valid by the NIPOST test API":result.status==="invalid"?"Not confirmed valid by the NIPOST test API":"Unconfirmed"}</p><p>Source: NIPOST Level 1 test API</p>{result.status!=="verified"&&<p role="status" className="rounded border border-amber-500 p-3">The sandbox lookup could not confirm this postcode. We have observed discrepancies for documented sandbox examples. Check it independently on the official NIPOST dashboard. This result does not prove your physical location is invalid.</p>}<p>Address and location are not verified. Do not use this result to determine evacuation routes or emergency dispatch.</p></section>}
 <section className="rounded border p-5 space-y-3" aria-labelledby="manual-location-title"><h2 id="manual-location-title" className="font-semibold">Location fallback for emergency reporting</h2><p>If postcode verification fails or disagrees with the official dashboard, you can describe your location manually. This does not verify an address or send an emergency alert.</p><label htmlFor="manual-location" className="block font-medium">Location description (optional)</label><textarea id="manual-location" value={manualLocation} onChange={e=>setManualLocation(e.target.value)} maxLength={500} rows={3} placeholder="Nearby landmark, area, LGA and state — avoid personal details" className="w-full border rounded p-3 text-black" /><p className="text-sm">This description is not submitted to NIPOST or saved by this verification form. If you continue to reporting, it will be passed in browser navigation state to prefill the report form, not included in the URL. Avoid sensitive personal information; review the description before submitting.</p><Link to="/report" state={{ manualLocation: manualLocation.trim() }} className="inline-block rounded bg-blue-700 px-4 py-2 text-white">Continue to incident reporting</Link></section>
 <p className="text-sm">The NIPOST test service may be unavailable until authorised credentials and the documented API contract are configured. No API keys are exposed in the browser.</p>
 </main>;
}
