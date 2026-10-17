import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { getSessionCookie } from "@repo/auth/cookies";

const AUTH_PATHS = new Set(["/signin", "/signup"]);

export default async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (AUTH_PATHS.has(pathname)) {
    if (sessionCookie) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // The landing page is public for signed-in and signed-out visitors alike.
  // Never infer a valid session from cookie presence at this route.
  if (pathname === "/") return NextResponse.next();

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
