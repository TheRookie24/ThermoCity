import { apiFetch } from "./client";

export type City = { id: string; name: string; code: string };
export type Zone = { id: string; city_id: string; name: string };
export type Road = { id: string; city_id: string; zone_id: string; name: string };
export type Segment = {
  id: string;
  city_id: string;
  zone_id: string;
  road_id: string;
  name: string;
  geometry: { type: "LineString"; coordinates: number[][] };
  is_active: boolean;
};

export async function listCities() {
  return apiFetch<City[]>("/assets/cities");
}
export async function listZones(city_id?: string) {
  const q = city_id ? `?city_id=${encodeURIComponent(city_id)}` : "";
  return apiFetch<Zone[]>(`/assets/zones${q}`);
}
export async function listSegments(filters: { city_id?: string; zone_id?: string } = {}) {
  const qp = new URLSearchParams(filters as any).toString();
  return apiFetch<Segment[]>(`/assets/segments${qp ? `?${qp}` : ""}`);
}

export async function createDoc(kind: string, payload: any) {
  return apiFetch<any>(`/assets/${kind}`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateDoc(kind: string, id: string, payload: any) {
  return apiFetch<any>(`/assets/${kind}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteDoc(kind: string, id: string) {
  return apiFetch<any>(`/assets/${kind}/${id}`, { method: "DELETE" });
}
