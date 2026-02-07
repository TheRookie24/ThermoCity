import { apiFetch, API_BASE } from "./client";

export async function createPdf(city_id: string, from: string, to: string) {
  return apiFetch<{ url: string; file: string }>("/reports/pdf", {
    method: "POST",
    body: JSON.stringify({ city_id, from, to }),
  });
}

export async function createXlsx(city_id: string, from: string, to: string) {
  return apiFetch<{ url: string; file: string }>("/reports/xlsx", {
    method: "POST",
    body: JSON.stringify({ city_id, from, to }),
  });
}

export function absoluteDownloadUrl(relativeUrl: string) {
  // backend returns /api/...; API_BASE already includes /api
  // so remove /api prefix if present
  if (relativeUrl.startsWith("/api")) return `${API_BASE}${relativeUrl.slice(4)}`;
  return `${API_BASE}${relativeUrl}`;
}
