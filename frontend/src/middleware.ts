import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that strictly require authenticated student or admin session
const PROTECTED_ROUTES = [
  "/dashboard",
  "/my-courses",
  "/settings",
  "/certificates",
  "/checkout",
  "/test",
];

// Routes reserved only for guest visitors (redirect to /dashboard if logged in)
const GUEST_ONLY_ROUTES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Check for authentication cookies (support both backend JWT accessToken and session cookie)
  const accessToken = request.cookies.get("accessToken")?.value;
  const bstormSession = request.cookies.get("bstorm_session")?.value;
  const isAuthenticated = Boolean(accessToken || bstormSession);

  // Check if current route requires authentication
  const isProtectedRoute =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.includes("/learn");

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Check if current route is guest-only
  const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route));
  if (isGuestOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (/images, etc.)
     * - api routes (handled by backend or Next.js route handlers)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
