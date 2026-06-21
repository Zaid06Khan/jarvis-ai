import { NextRequest, NextResponse } from "next/server";
import { routerJson } from "@/lib/router";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { prompt, size } = await req.json().catch(() => ({}));
  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });
  try {
    const data = await routerJson("/image/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, size, topic: prompt.slice(0, 80) }),
    });
    return NextResponse.json({ url: data.url, size: data.size });
  } catch {
    return NextResponse.json({ error: "Image generation failed (router/DALL-E)" }, { status: 502 });
  }
}
