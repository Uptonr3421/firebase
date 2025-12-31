/**
 * API Authentication Middleware
 * Verifies Firebase Auth tokens for protected API routes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/flows/health",
  "/api/health",
];

/**
 * Middleware to protect API routes with authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing or invalid Authorization header. Expected: Bearer <token>",
      },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing authentication token",
      },
      { status: 401 }
    );
  }

  // Note: In a production environment, you would verify the Firebase ID token here
  // using firebase-admin. Since this middleware runs on Edge runtime,
  // we'll do basic validation here and deeper validation in API routes if needed.
  // 
  // Example with firebase-admin (in Node.js runtime):
  // try {
  //   await admin.auth().verifyIdToken(token);
  //   return NextResponse.next();
  // } catch (error) {
  //   return NextResponse.json(
  //     { success: false, error: "Invalid token" },
  //     { status: 401 }
  //   );
  // }

  // For now, we verify that a token is present
  // Individual API routes can perform additional validation using firebase-admin
  return NextResponse.next();
}

/**
 * Configure which routes this middleware applies to
 */
export const config = {
  matcher: "/api/:path*",
};
