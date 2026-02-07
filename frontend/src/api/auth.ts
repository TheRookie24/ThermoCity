import { apiFetch } from "./client";

export type Me = { id: number; username: string; role: string };

export async function login(username: string, password: string) {
  return apiFetch<{ ok: boolean }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

export async function me() {
  return apiFetch<Me>("/auth/me");
}
