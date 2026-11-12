import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/signin", "/signup"];

// Only used to pick a redirect target; the backend verifies the token on every request.
function roleFromToken(token: string): string | undefined {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).role;
  } catch {
    return undefined;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (token && isPublic) {
    const home = roleFromToken(token) === "admin" ? "/admin/quotes" : "/quotes";
    return NextResponse.redirect(new URL(home, request.url));
  }
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/quotes/:path*", "/admin/:path*"],
};
