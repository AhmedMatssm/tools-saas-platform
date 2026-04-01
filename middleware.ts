import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Zero-Trust Edge Middleware
 * - Admin routes: require ADMIN role
 * - Protected UI routes: require any valid session → redirect to /login
 * - Protected API routes: require any valid session → return 401
 */
export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token

    // ── 1. ADMIN GUARD ────────────────────────────────────
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      if (!token || token.role !== "ADMIN") {
        console.warn(`[SECURITY] Unauthorized admin access attempt: ${path}`)
        if (path.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        return NextResponse.rewrite(new URL("/404", req.url))
      }
    }

    // ── 2. PROTECTED API GUARD ────────────────────────────
    // Return 401 JSON for unauthenticated API calls
    const protectedApiPaths = [
      "/api/generate",
      "/api/generate-image",
      "/api/history",
      "/api/user",
      "/api/account/settings", // Only protect specific sub-paths if /api/account is partly public
      "/api/account/billing",
      "/api/saved",
      "/api/upload",
    ]

    const isProtectedApi = protectedApiPaths.some(p => path.startsWith(p))
    // Explicitly allow registration even if it matches the prefix (though we've changed the list above)
    const isRegisterApi = path === "/api/account/register"

    if (isProtectedApi && !isRegisterApi && !token) {
      return NextResponse.json(
        { error: "Unauthorized — authentication required" },
        { status: 401 }
      )
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname

        // Allow public pages and auth endpoints through
        const publicPaths = [
          "/", "/login", "/register", "/signup", "/blog", "/pricing",
          "/contact", "/faq", "/tools", "/api/auth", "/api/account/register",
          "/api/faqs", "/api/blog", "/api/posts", "/api/contact",
          "/api/comments", "/api/stats",
        ]
        const isPublic = publicPaths.some(p => path.startsWith(p))
        if (isPublic) return true

        // Everything else requires a valid token
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    // Protected UI routes
    "/dashboard/:path*",
    "/history/:path*",
    "/generate/:path*",
    "/settings/:path*",
    "/saved/:path*",
    "/billing/:path*",
    "/admin/:path*",
    // Protected API routes
    "/api/generate/:path*",
    "/api/generate-image/:path*",
    "/api/history/:path*",
    "/api/user/:path*",
    "/api/account/:path*",
    "/api/saved/:path*",
    "/api/upload/:path*",
    "/api/admin/:path*",
  ]
}
