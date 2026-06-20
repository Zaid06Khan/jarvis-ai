import { NextResponse } from "next/server";
import { routerJson } from "@/lib/router";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await routerJson("/agents");
    return NextResponse.json({ agents: data.agents || [], up: true });
  } catch {
    return NextResponse.json({ agents: [], up: false });
  }
}
