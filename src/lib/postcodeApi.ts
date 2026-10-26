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
  if (!apiBase) throw new Error("Postcode lookup is not configured.");
  const response = await fetch(`${apiBase}/api/v1/postcodes/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcode }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : "Postcode lookup failed.");
  }
  return response.json();
}
