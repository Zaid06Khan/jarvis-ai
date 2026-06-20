/** Server-side helper to call the Jarvis FastAPI router (token kept server-side). */
const BASE = process.env.ROUTER_URL || "http://159.203.3.38:8000";
const TOKEN = process.env.ROUTER_TOKEN || "";

export async function routerFetch(path: string, init?: RequestInit) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  return res;
}

export async function routerJson(path: string, init?: RequestInit) {
  const res = await routerFetch(path, init);
  if (!res.ok) throw new Error(`router ${path} -> ${res.status}`);
  return res.json();
}

export const ROUTER_BASE = BASE;
