import { apiFetch } from "./client";

export type AlertRule = {
  id: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  scope: string;
  city_id?: string;
};

export type AlertEvent = {
  id: string;
  metric: string;
  severity: string;
  status: string;
  opened_at: string;
  segment_id?: string;
  value?: number;
  notes?: string;
};

export async function listEvents(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AlertEvent[]>(`/alerts/events${q}`);
}

export async function actionEvent(id: string, status: "acknowledged" | "closed", notes?: string) {
  return apiFetch<AlertEvent>(`/alerts/events/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ status, notes: notes || "" }),
  });
}
