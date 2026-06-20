import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const items: any[] = [];
  try {
    const sb = supabaseAdmin();
    const { data: sales } = await sb.from("revenue")
      .select("source,amount,occurred_at").order("occurred_at", { ascending: false }).limit(5);
    for (const s of sales || [])
      items.push({ kind: "sale", text: `${s.source}: $${Number(s.amount).toFixed(0)} sale`, at: s.occurred_at });

    const { data: done } = await sb.from("content_queue")
      .select("topic,platform,created_at").order("created_at", { ascending: false }).limit(6);
    for (const d of done || [])
      items.push({ kind: "jarvis", text: `Generated ${d.platform} · ${d.topic}`.slice(0, 70), at: d.created_at });
  } catch {}
  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return NextResponse.json({ items: items.slice(0, 10) });
}
