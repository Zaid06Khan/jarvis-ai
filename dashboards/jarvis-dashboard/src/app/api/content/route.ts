import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform");
  const status = req.nextUrl.searchParams.get("status");
  try {
    const sb = supabaseAdmin();
    let q = sb.from("content_queue").select("*").order("created_at", { ascending: false }).limit(200);
    if (platform && platform !== "all") q = q.eq("platform", platform);
    if (status && status !== "all") q = q.eq("status", status);
    const { data } = await q;
    return NextResponse.json({ items: data || [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !status) return NextResponse.json({ error: "missing" }, { status: 400 });
  try {
    const sb = supabaseAdmin();
    await sb.from("content_queue").update({ status }).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
