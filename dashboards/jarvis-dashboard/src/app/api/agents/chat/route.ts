import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { routerJson } from "@/lib/router";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const agent = req.nextUrl.searchParams.get("agent") || "hermes-core";
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("agent_chats")
      .select("role,content,model,created_at").eq("agent", agent)
      .order("created_at", { ascending: true }).limit(50);
    return NextResponse.json({ messages: data || [] });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: NextRequest) {
  const { agent, message } = await req.json().catch(() => ({}));
  if (!agent || !message) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  let reply = "", model = "";
  try {
    const data = await routerJson("/chat", {
      method: "POST",
      body: JSON.stringify({ agent, message, max_tokens: 1500 }),
    });
    reply = data.response; model = data.model;
  } catch {
    return NextResponse.json({ error: "Router unreachable" }, { status: 502 });
  }

  try {
    const sb = supabaseAdmin();
    await sb.from("agent_chats").insert([
      { agent, role: "user", content: message },
      { agent, role: "assistant", content: reply, model },
    ]);
  } catch {}

  return NextResponse.json({ reply, model });
}
