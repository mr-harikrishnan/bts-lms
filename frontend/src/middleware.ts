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

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const bstormSession = request.cookies.get("bstorm_session")?.value;

  let isAuthenticated = Boolean(accessToken || bstormSession);

  // Check if current route requires authentication
  const isProtectedRoute =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.includes("/learn");

  // If accessToken is missing or expired, but refreshToken is available, proactively refresh
  if (isProtectedRoute && !isAuthenticated && refreshToken) {
    try {
      const refreshRes = await fetch(`${BACKEND_API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      const refreshData = await refreshRes.json().catch(() => null);

      if (refreshRes.ok && refreshData?.success && refreshData?.data?.accessToken) {
        isAuthenticated = true;
        const response = NextResponse.next();

        response.cookies.set("accessToken", refreshData.data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60,
        });

        if (refreshData.data.refreshToken) {
          response.cookies.set("refreshToken", refreshData.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
          });
        }

        return response;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect unauthenticated users attempting to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from guest-only pages
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
