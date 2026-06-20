import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { routerFetch } from "@/lib/router";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("products").select("*").eq("type", "ebook")
      .order("created_at", { ascending: false });
    return NextResponse.json({ items: data || [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  const { niche } = await req.json().catch(() => ({}));
  try {
    await routerFetch("/ebook/generate", { method: "POST", body: JSON.stringify({ niche: niche || "" }) });
    return NextResponse.json({ ok: true, message: `Ebook generation started${niche ? ` for "${niche}"` : ""}.` });
  } catch {
    return NextResponse.json({ ok: false, message: "Router unreachable" }, { status: 502 });
  }
}
