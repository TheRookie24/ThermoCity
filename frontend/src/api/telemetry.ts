import { apiFetch } from "./client";

export type Telemetry = {
  id: string;
  ts: string;
  temps?: Record<string, number>;
  flow?: number;
  pressure?: number;
  kw_gross?: number;
  kwh_total?: number;
  pump_power?: number;
  fan_power?: number;
  pcm_temp?: number;
};

export async function queryTelemetry(segment_id: string, from?: string, to?: string) {
  const p = new URLSearchParams({ scope: "segment", segment_id });
  if (from) p.set("from", from);
  if (to) p.set("to", to);
  return apiFetch<Telemetry[]>(`/telemetry/query?${p.toString()}`);
}
