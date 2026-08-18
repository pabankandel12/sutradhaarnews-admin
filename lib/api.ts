export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sutradhaarnews-api.onrender.com/api/v1";
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("sutradhaar_admin_token") : null;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || "अनुरोध पूरा भएन"); }
  return response.json();
}
