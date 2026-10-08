import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("kaamhub_session");
  const hasSession = !!sessionCookie?.value;

  // 1. If user is signed in and visits login or register pages, redirect to appropriate destination
  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    let target = "/dashboard";
    try {
      // Decode JWT payload without crypto dependency for Edge middleware
      const tokenParts = sessionCookie.value.split(".");
      if (tokenParts.length === 3) {
        const payloadJson = atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);
        if (payload.role === "ADMIN") {
          target = "/admin";
        } else if (payload.role === "PROVIDER") {
          target = "/provider";
        }
      }
    } catch {
      target = "/dashboard";
    }

    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    if (redirectUrl && redirectUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. If user is NOT signed in and tries to access protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/admin");

  if (!hasSession && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/provider/:path*", "/admin/:path*"],
};
