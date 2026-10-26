import type { FloodReport } from "@/lib/storage";

export const apiBase = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");

export type ReportReceipt = FloodReport & { receipt_token: string };

export async function checkReportStatus(id: string, token: string): Promise<{id: string; status: string; submitted_at: string; dispatch: string}> {
  if (!apiBase) throw new Error("Central reporting is not configured.");
  const response = await fetch(`${apiBase}/api/v1/reports/${encodeURIComponent(id)}/status`, { headers: { "X-Report-Receipt": token }, cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 404 ? "Report or receipt token not found." : "Status service unavailable.");
  return response.json();
}

export async function submitFloodReport(data: Omit<FloodReport, "id" | "timestamp" | "status"> & { postcode?: string }): Promise<ReportReceipt> {
  if (!apiBase) throw new Error("Central reporting is not configured. Please try again when the service is available.");
  // Photos require a separate, secure upload workflow. Never send base64 images to the JSON endpoint.
  const { image: _image, ...report } = data;
  const response = await fetch(`${apiBase}/api/v1/reports`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error("Report could not be received by the server. Please retry.");
  return response.json();
}
