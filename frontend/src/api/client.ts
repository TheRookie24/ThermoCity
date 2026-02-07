export const API_BASE = import.meta.env.VITE_API_BASE || "/api";


export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.detail || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  // for download endpoints (handled separately)
  return (await res.text()) as unknown as T;
}
