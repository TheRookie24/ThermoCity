import { apiFetch } from "./client";

export type WorkOrder = {
  id: string;
  title: string;
  asset_id: string;
  priority: string;
  status: string;
  assigned_to?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export async function listWorkOrders(asset_id?: string) {
  const q = asset_id ? `?asset_id=${encodeURIComponent(asset_id)}` : "";
  return apiFetch<WorkOrder[]>(`/maintenance/workorders${q}`);
}

export async function createWorkOrder(payload: any) {
  return apiFetch<WorkOrder>("/maintenance/workorders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkOrder(id: string, payload: any) {
  return apiFetch<WorkOrder>(`/maintenance/workorders/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
