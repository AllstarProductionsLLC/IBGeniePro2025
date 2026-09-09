"use client";
let token: string | undefined,
  expiry = 0,
  revision = 0;
export function setSession(value?: string, expiresAt = 0) {
  token = value;
  expiry = expiresAt;
  revision++;
}
export function getSessionExpiry() {
  return expiry;
}
export function getSessionVersion() {
  return revision;
}
export async function apiFetch(path: string, options: RequestInit = {}) {
  if (!path.startsWith("/api/") || path.startsWith("//"))
    throw new Error("Use an app API path.");
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", "Bearer " + token);
  const response = await fetch(path, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (response.status === 401 && !path.startsWith("/api/access"))
    window.dispatchEvent(new Event("ibgenie:session-expired"));
  if (!path.startsWith("/api/access"))
    window.dispatchEvent(new Event("ibgenie:usage-changed"));
  return response;
}
