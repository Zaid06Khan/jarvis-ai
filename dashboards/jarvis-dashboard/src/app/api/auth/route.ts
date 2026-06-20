import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET || "jarvis-session-ok";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.DASHBOARD_PASSWORD || "jarvis";
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("jarvis_auth", SECRET, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("jarvis_auth", "", { path: "/", maxAge: 0 });
  return res;
}
