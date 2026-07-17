import { NextRequest, NextResponse } from "next/server";
import { routerFetch } from "@/lib/router";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { action, niche } = await req.json().catch(() => ({}));
  try {
    if (action === "run-overnight") {
      await routerFetch("/overnight/trigger", { method: "POST", body: "{}" });
      return NextResponse.json({ ok: true, message: "Overnight engine started — check the Overnight Log shortly." });
    }
    if (action === "generate-ebook") {
      await routerFetch("/ebook/generate", { method: "POST", body: JSON.stringify({ niche: niche || "" }) });
      return NextResponse.json({ ok: true, message: `Ebook generation started${niche ? ` for "${niche}"` : ""}.` });
    }
    if (action === "morning-brief") {
      const res = await routerFetch("/brief/send", { method: "POST", body: "{}" });
      const j = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: true, message: j.delivered ? "Morning brief sent to Discord." : "Latest brief ready.", brief: j.brief });
    }
    return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: "Router unreachable — is it exposed publicly with a token?" }, { status: 502 });
  }
}
