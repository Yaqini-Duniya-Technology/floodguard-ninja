import { useState } from "react";
const api = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");
type Verification = { postcode: string; status: string; state: string | null; lga: string | null; latitude: number | null; longitude: number | null; source: string };
export default function PostcodeVerification() {
 const [postcode,setPostcode]=useState("");
 const [result,setResult]=useState<Verification|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
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
 <form onSubmit={verify} className="space-y-3"><label htmlFor="postcode" className="block font-semibold">Digital postcode</label><input id="postcode" value={postcode} onChange={e=>setPostcode(e.target.value)} maxLength={40} autoComplete="off" placeholder="SS-LL-PDD-AA-DD" className="w-full border rounded p-3 text-black" /><button type="submit" disabled={busy} className="rounded bg-blue-700 px-5 py-3 text-white disabled:opacity-50">{busy?"Verifying…":"Verify postcode validity"}</button></form>
 {error&&<p role="alert" className="rounded border p-3">{error}</p>}
 {result&&<section aria-live="polite" className="border rounded p-5 space-y-2"><h2 className="font-semibold">Level 1 result</h2><p>Postcode: {result.postcode}</p><p>Validity: {result.status==="verified"?"Valid according to the configured test response":result.status==="invalid"?"Invalid according to the configured test response":"Unconfirmed"}</p><p>Source: NIPOST Level 1 sandbox adapter</p><p>Address and location are not verified. Do not use this result to determine evacuation routes or emergency dispatch.</p></section>}
 <p className="text-sm">The NIPOST test service may be unavailable until authorised credentials and the documented API contract are configured. No API keys are exposed in the browser.</p>
 </main>;
}
