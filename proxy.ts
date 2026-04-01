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

  // Skip auth check for public routes and static assets
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  try {
    // Check for Supabase session cookie
    const authCookie = request.cookies.get("sb-auth-token");
    const sessionCookie = request.cookies
      .getAll()
      .find((c) => c.name.includes("auth-token"));

    // Check if user has a valid session
    const hasSession = authCookie || sessionCookie;

    // If no session and trying to access protected route, redirect to signin
    if (!hasSession && !publicRoutes.includes(pathname)) {
      const redirectUrl = new URL("/auth/signin", request.url);
      redirectUrl.searchParams.set(`redirectedFrom`, pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // If there was an error, just return a response
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Protect all routes except:
    "/((?!auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
