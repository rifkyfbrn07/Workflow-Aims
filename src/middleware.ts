import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("worktrack_session")?.value;

  // Static files, Next.js internal paths, API routes, or images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";

  // Case 1: Unauthenticated user trying to access protected routes
  if (!sessionToken && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: Authenticated user accessing /login or root /
  if (sessionToken && (isLoginPage || pathname === "/")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Case 3: Root / redirect for unauthenticated user
  if (!sessionToken && pathname === "/") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
