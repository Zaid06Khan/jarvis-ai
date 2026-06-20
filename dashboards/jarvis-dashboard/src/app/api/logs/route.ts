import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("content_queue")
      .select("id,topic,raw_content,created_at")
      .eq("platform", "overnight-brief")
      .order("created_at", { ascending: false }).limit(60);
    return NextResponse.json({ items: data || [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
