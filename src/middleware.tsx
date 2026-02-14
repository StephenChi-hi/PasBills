// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

// Middleware currently does not enforce redirects.
// Auth is handled by the client-side AuthGate component.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Disable route matching so this middleware is effectively a no-op.
export const config = {
  matcher: [],
};
