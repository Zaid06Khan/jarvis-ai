import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { routerJson } from "@/lib/router";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
    return NextResponse.json({ items: data || [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  try {
    const sb = supabaseAdmin();
    await sb.from("leads").update(fields).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST -> generate a follow-up message via Jarvis (hermes-outreach)
export async function POST(req: NextRequest) {
  const { name, type, status, notes } = await req.json().catch(() => ({}));
  try {
    const data = await routerJson("/chat", {
      method: "POST",
      body: JSON.stringify({
        agent: "hermes-outreach",
        message: `Write a short, warm follow-up message to a Toronto ${type || "business"} named "${name}". ` +
          `Current pipeline stage: ${status || "contacted"}. Context: ${notes || "AI receptionist (Aria) outreach"}. ` +
          `Keep it 3-4 sentences, friendly, with a clear next step.`,
        max_tokens: 500,
      }),
    });
    return NextResponse.json({ message: data.response });
  } catch {
    return NextResponse.json({ error: "Router unreachable" }, { status: 502 });
  }
}
