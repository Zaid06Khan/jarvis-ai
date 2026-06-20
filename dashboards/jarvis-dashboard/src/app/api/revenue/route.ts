import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const GOAL = Number(process.env.MONTHLY_REVENUE_GOAL || 5000);

export async function GET() {
  const out: any = {
    series: [], bySource: { gumroad: 0, etsy: 0, aria: 0 },
    totals: { month: 0, all: 0 }, aria: { mrr: 0, clients: 0 }, goal: GOAL,
  };
  let sb;
  try { sb = supabaseAdmin(); } catch { return NextResponse.json(out); }

  try {
    const { data } = await sb.from("revenue").select("source,amount,occurred_at").order("occurred_at");
    const rows = data || [];
    // build a per-day series for last 30 days
    const days: Record<string, any> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      days[key] = { label: d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }), gumroad: 0, etsy: 0, aria: 0 };
    }
    const monthStart = Date.now() - 30 * 86400000;
    for (const r of rows) {
      const key = new Date(r.occurred_at).toISOString().slice(0, 10);
      const amt = Number(r.amount || 0);
      const src = (r.source || "gumroad").toLowerCase();
      if (days[key] && days[key][src] !== undefined) days[key][src] += amt;
      out.all = (out.all || 0);
      if (out.bySource[src] !== undefined) out.bySource[src] += amt;
      out.totals.all += amt;
      if (new Date(r.occurred_at).getTime() >= monthStart) out.totals.month += amt;
    }
    out.series = Object.values(days);
  } catch {}

  try {
    const { data, count } = await sb.from("members")
      .select("plan", { count: "exact" }).eq("status", "active");
    out.aria.clients = count || (data?.length || 0);
    out.aria.mrr = out.bySource.aria; // approximate monthly recurring from aria revenue
  } catch {}

  return NextResponse.json(out);
}
