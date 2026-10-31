const apiBase = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");

export type PostcodeLocation = {
  postcode: string;
  status: "verified" | "unavailable";
  state: string | null;
  lga: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
};

export async function resolvePostcode(postcode: string): Promise<PostcodeLocation> {
  const normalized = postcode.trim().toUpperCase().replace(/[ -]/g, "");
  if (!/^[A-Z0-9]{11}$/.test(normalized)) throw new Error("Enter an 11-character Digital Postcode (letters and numbers). This format check does not verify the location.");
  if (!apiBase) throw new Error("Postcode lookup is not configured.");
  const response = await fetch(`${apiBase}/api/v1/postcodes/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcode: normalized }),
  });
  if (!response.ok) {
    if (response.status === 503) throw new Error("Official NIPOST verification is pending. You can still submit a report with a descriptive location.");
    if (response.status === 422) throw new Error("Check the 11-character postcode and try again.");
    if (response.status === 429) throw new Error("Too many postcode checks. Please wait and try again.");
    throw new Error("Postcode lookup is temporarily unavailable. Enter a descriptive location.");
  }
  const result: PostcodeLocation = await response.json();
  if (result.status !== "verified" || result.source !== "nipost") throw new Error("Official postcode verification is not available.");
  return result;
}
