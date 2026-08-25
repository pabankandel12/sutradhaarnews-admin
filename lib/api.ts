const DEFAULT_API_URL = "https://sutradhaarnews-api.onrender.com/api/v1";

function normalizeApiUrl(value?: string) {
  const url = (value || DEFAULT_API_URL).trim().replace(/\/+$/, "");
  return url.endsWith("/api/v1") ? url : `${url}/api/v1`;
}

// This project-specific name prevents an unrelated NEXT_PUBLIC_API_URL left in
// Vercel from being embedded into the browser bundle.
export const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_SUTRADHAAR_API_URL);
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("sutradhaar_admin_token") : null;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || "अनुरोध पूरा भएन"); }
  return response.json();
}
