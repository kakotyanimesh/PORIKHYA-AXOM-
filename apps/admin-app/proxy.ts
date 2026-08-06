import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@repo/auth/cookies";

// Cheap cookie-presence gate only. Authorization (the ADMIN_EMAILS allowlist)
// is enforced server-side in requireAdmin() — a cookie proves logged-in, not
// admin. proxy must NOT redirect /signin -> / on cookie presence: cookies
// ignore port, so a stale localhost:3000 web session cookie reaches :3001;
// pairing a "has cookie -> /" redirect with requireAdmin's "not admin ->
// /signin" redirect produces an infinite loop (ERR_TOO_MANY_REDIRECTS).
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /signin always renders — never bounce it, or non-admins loop.
  if (pathname === "/signin") return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
