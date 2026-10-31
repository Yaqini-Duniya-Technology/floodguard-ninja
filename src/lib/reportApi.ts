import type { FloodReport } from "@/lib/storage";

export const apiBase = import.meta.env.VITE_FLOODGUARD_API_URL?.replace(/\/$/, "");

export type ReportCoordinates = {
  latitude: number;
  longitude: number;
  coordinate_source: "gps" | "manual";
  accuracy_m?: number;
  coordinate_consent: true;
};

export type ReportReceipt = FloodReport & { receipt_token: string };

export async function checkReportStatus(id: string, token: string): Promise<{id: string; status: string; submitted_at: string; dispatch: string}> {
  if (!apiBase) throw new Error("Central reporting is not configured.");
  const response = await fetch(`${apiBase}/api/v1/reports/${encodeURIComponent(id)}/status`, { headers: { "X-Report-Receipt": token }, cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 404 ? "Report or receipt token not found." : "Status service unavailable.");
  return response.json();
}

export async function submitFloodReport(data: Omit<FloodReport, "id" | "timestamp" | "status"> & { postcode?: string } & Partial<ReportCoordinates>): Promise<ReportReceipt> {
  if (!apiBase) throw new Error("Central reporting is not configured. Please try again when the service is available.");
  // Photos require a separate, secure upload workflow. Never send base64 images to the JSON endpoint.
  const { image: _image, ...report } = data;
  if (report.latitude !== undefined && report.coordinate_consent !== true) throw new Error("Location consent is required.");
  if ((report.latitude === undefined) !== (report.longitude === undefined)) throw new Error("Both latitude and longitude are required.");
  if (report.latitude !== undefined && !["gps", "manual"].includes(report.coordinate_source || "")) throw new Error("Coordinate source is required.");
  if (report.coordinate_consent && report.latitude === undefined) throw new Error("Select coordinates before granting location consent.");
  if (report.latitude !== undefined && (!Number.isFinite(report.latitude) || !Number.isFinite(report.longitude) || Math.abs(report.latitude) > 90 || Math.abs(report.longitude!) > 180)) throw new Error("Invalid coordinates.");
  if (report.accuracy_m !== undefined && (report.coordinate_source !== "gps" || !Number.isFinite(report.accuracy_m) || report.accuracy_m < 0 || report.accuracy_m > 100000)) throw new Error("Invalid GPS accuracy.");
  const response = await fetch(`${apiBase}/api/v1/reports`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(report),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("Too many reports submitted. Please wait before trying again.");
    if (response.status === 422) throw new Error("Some report details are invalid. Please review the form.");
    throw new Error("Report could not be received by the server. Please retry.");
  }
  return response.json();
}
