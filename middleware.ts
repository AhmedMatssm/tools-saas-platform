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

    // ── 0. VISITOR TRACKING (Non-blocking) ────────────────
    // Track every page view, excluding internal API/assets
    if (!path.includes(".") && !path.startsWith("/api") && !path.startsWith("/_next")) {
      const origin = req.nextUrl.origin
      fetch(`${origin}/api/track-visitor`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "user-agent": req.headers.get("user-agent") || "Unknown",
          "x-forwarded-for": req.headers.get("x-forwarded-for") || "127.0.0.1"
        },
        body: JSON.stringify({ path })
      }).catch(err => console.error("[MIDDLEWARE_TRACKING_ERROR]:", err))
    }

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
      "/api/notifications", // CRITICAL: Added notifications protection
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

    // ── 3. SECURITY HEADERS ────────────────────────────────
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname

        // Skip auth for static files, robots, sitemap, etc.
        if (path.includes(".") || path.startsWith("/_next")) return true

        // Allow public pages and auth endpoints through
        const publicPaths = [
          "/", "/login", "/register", "/signup", "/blog", "/pricing",
          "/contact", "/faq", "/tools", "/api/auth", "/api/account/register",
          "/api/faqs", "/api/blog", "/api/posts", "/api/contact",
          "/api/comments", "/api/stats", "/api/track-visitor",
          "/reset-password", "/api/account/reset-password", "/api/chat"
        ]
        const isPublic = publicPaths.some(p => 
          p === "/" ? path === "/" : path.startsWith(p)
        )
        if (isPublic) return true

        // Everything else requires a valid token
        return !!token
      }
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    // Include all paths, let logic decide inside middleware
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
}
