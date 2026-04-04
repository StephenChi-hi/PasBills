import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all routes to render - let client-side handle auth redirects
  // to avoid hydration mismatches
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match auth and home routes only
    "/(auth|home|$)",
  ],
};
