import { NextResponse } from "next/server";
import { routerJson } from "@/lib/router";

export const dynamic = "force-dynamic";

export async function GET() {
  const out: any = {
    services: [], vps: null, providers: { anthropic: false, openai: false, gemini: false },
    routerUp: false,
  };
  try {
    const health = await routerJson("/health");
    out.routerUp = true;
    out.providers.anthropic = true;
    out.providers.openai = !!health.codex;
    out.providers.gemini = !!health.gemini;
  } catch {}

  try {
    const stats = await routerJson("/system/stats");
    out.vps = stats.vps || null;
    out.services = stats.services || [];
    if (stats.providers) out.providers = { ...out.providers, ...stats.providers };
  } catch {
    // minimal fallback if /system/stats not available
    out.services = [
      { name: "FastAPI Router", up: out.routerUp },
      { name: "Hermes Gateway", up: null },
      { name: "n8n", up: null },
      { name: "Redis", up: null },
      { name: "Supabase", up: true },
    ];
  }
  return NextResponse.json(out);
}
