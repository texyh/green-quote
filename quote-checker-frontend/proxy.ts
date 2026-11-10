import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/signin", "/signup"];

export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has("access_token");
  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (signedIn && isPublic) {
    return NextResponse.redirect(new URL("/quotes", request.url));
  }
  if (!signedIn && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/signup", "/quotes/:path*"],
};
