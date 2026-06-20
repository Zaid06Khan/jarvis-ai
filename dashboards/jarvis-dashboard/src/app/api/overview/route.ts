import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { routerJson } from "@/lib/router";

export const dynamic = "force-dynamic";

const FALLBACK_AGENTS = [
  "hermes-core","hermes-content","hermes-advisor","hermes-credihire","hermes-research",
  "hermes-email","hermes-proposals","hermes-outreach","hermes-funnel","hermes-ops",
  "hermes-finance","hermes-crm","hermes-whop","hermes-etsy","hermes-gumroad",
  "hermes-builder","hermes-social","hermes-seo","hermes-tiktok","hermes-ads","hermes-pinterest",
];

function periodSums(rows: any[]) {
  const now = Date.now();
  const day = 86400000;
  const sum = (since: number) =>
    rows.filter((r) => new Date(r.occurred_at).getTime() >= now - since)
        .reduce((a, r) => a + Number(r.amount || 0), 0);
  return { today: sum(day), week: sum(day * 7), month: sum(day * 30) };
}

export async function GET() {
  const out: any = {
    agents: [], routerUp: false, revenue: { today: 0, week: 0, month: 0 },
    activity: [], lastActions: [], counts: { pendingContent: 0, leads: 0, ebooks: 0 },
  };

  // agents + router status
  try {
    const data = await routerJson("/agents");
    out.routerUp = true;
    out.agents = (data.agents || []).map((a: any) => ({ name: a.name, tier: a.tier, status: "online" }));
  } catch {
    out.agents = FALLBACK_AGENTS.map((name) => ({ name, tier: "?", status: "offline" }));
  }

  const sb = (() => { try { return supabaseAdmin(); } catch { return null; } })();
  if (sb) {
    try {
      const { data } = await sb.from("revenue").select("amount,occurred_at");
      out.revenue = periodSums(data || []);
    } catch {}
    try {
      const { data } = await sb.from("content_queue")
        .select("id,topic,platform,status,created_at").order("created_at", { ascending: false }).limit(10);
      out.activity = data || [];
    } catch {}
    try {
      const { data } = await sb.from("content_queue")
        .select("topic,platform,status,created_at")
        .in("platform", ["overnight-brief", "product-idea"])
        .order("created_at", { ascending: false }).limit(5);
      out.lastActions = data || [];
    } catch {}
    try {
      const { count } = await sb.from("content_queue").select("id", { count: "exact", head: true }).eq("status", "pending");
      out.counts.pendingContent = count || 0;
    } catch {}
    try {
      const { count } = await sb.from("leads").select("id", { count: "exact", head: true });
      out.counts.leads = count || 0;
    } catch {}
    try {
      const { count } = await sb.from("products").select("id", { count: "exact", head: true }).eq("type", "ebook");
      out.counts.ebooks = count || 0;
    } catch {}
  }
  return NextResponse.json(out);
}
