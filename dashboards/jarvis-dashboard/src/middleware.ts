import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET || "jarvis-session-ok";

export function middleware(req: NextRequest) {
  const authed = req.cookies.get("jarvis_auth")?.value === SECRET;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/login"] };
