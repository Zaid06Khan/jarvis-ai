/** Server-side helper to call the Jarvis FastAPI router. */
const ROUTER_TIMEOUT_MS = 55_000;

function routerConfig() {
  const url = process.env.ROUTER_URL;
  const token = process.env.ROUTER_TOKEN;

  if (!url || !token) {
    throw new Error("ROUTER_URL and ROUTER_TOKEN must be configured");
  }

  return { url: url.replace(/\/$/, ""), token };
}

export async function routerFetch(path: string, init?: RequestInit) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Router path must be a relative absolute-path reference");
  }

  const { url, token } = routerConfig();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${url}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(ROUTER_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Router request failed with status ${res.status}`);
  }

  return res;
}

export async function routerJson(path: string, init?: RequestInit) {
  const res = await routerFetch(path, init);
  return res.json();
}
