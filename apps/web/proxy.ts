import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@repo/auth/cookies";

const GUEST_ONLY_PATHS = new Set(["/", "/signin", "/signup"]);

export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (GUEST_ONLY_PATHS.has(pathname)) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/account/:path*",
    "/all-test-series/:path*",
    "/my-subscriptions/:path*",
    "/upgrade/:path*",
  ],
};
