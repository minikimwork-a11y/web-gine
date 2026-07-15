import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect administrative routes starting with /admin
  if (pathname.startsWith("/admin")) {
    const allCookies = request.cookies.getAll();
    
    // Supabase auth cookies typically start with "sb-"
    const hasAuthCookie = allCookies.some((cookie) => cookie.name.startsWith("sb-"));

    if (!hasAuthCookie) {
      // Redirect to login page if no auth cookies are found
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to run middleware only on /admin and its subroutes
export const config = {
  matcher: ["/admin/:path*"],
};
