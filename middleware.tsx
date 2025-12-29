// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // sb-access-token is Supabase session cookie
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // only protect /dashboard routes
};
