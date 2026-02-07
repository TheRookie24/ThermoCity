import { apiFetch } from "./client";

export type KPI = {
  id: string;
  ts: string;
  heat_captured_kw?: number;
  pcm_soc?: number;
  kw_net?: number;
  kw_gross?: number;
  parasitic_kw?: number;
  temps?: Record<string, number>;
};

export async function queryKpi(segment_id: string) {
  const p = new URLSearchParams({ scope: "segment", segment_id });
  return apiFetch<KPI[]>(`/kpi/query?${p.toString()}`);
}

export async function latestKpi(segment_id: string) {
  const p = new URLSearchParams({ scope: "segment", segment_id });
  return apiFetch<KPI>(`/kpi/latest?${p.toString()}`);
}
