import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Zero-Trust Edge Proxy (formerly Middleware)
 * - Admin routes: require ADMIN role
 * - Protected UI routes: require any valid session → redirect to /login
 * - Protected API routes: require any valid session → return 401
 */
export default withAuth(
  function proxy(req) {
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
      }).catch(err => console.error("[PROXY_TRACKING_ERROR]:", err))
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

    // ── 2. GENERAL PROTECTED API GUARD ────────────────────
    const protectedApiPaths = [
      "/api/generate", "/api/generate-image", "/api/history",
      "/api/user", "/api/account/settings", "/api/account/billing",
      "/api/saved", "/api/upload", "/api/notifications",
    ]

    const isProtectedApi = protectedApiPaths.some(p => path.startsWith(p))
    const isPublicPath = [
       "/", "/login", "/register", "/signup", "/blog", "/pricing",
       "/contact", "/faq", "/tools", "/api/auth", "/api/account/register",
       "/api/faqs", "/api/blog", "/api/posts", "/api/contact",
       "/api/comments", "/api/stats", "/api/track-visitor",
       "/reset-password", "/about", "/privacy", "/terms", "/cookies", "/categories"
    ].some(p => p === "/" ? path === "/" : path.startsWith(p))

    const isStatic = path.includes(".") || path.startsWith("/_next")

    if (!isPublicPath && !isStatic && !token) {
        if (path.startsWith("/api/")) {
           return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(req.url)}`, req.url))
    }

    // ── 3. SECURITY HEADERS ────────────────────────────────
    const response = NextResponse.next()
    
    // Core Security Headers (Redundant with next.config.js for safety)
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    
    // Advanced Isolation Headers
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin")
    
    // Permissions Policy
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")
    
    // Strict CSP (Dynamically managed if needed)
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://*.pusher.com; connect-src 'self' https://*.supabase.co https://*.pooler.supabase.com https://*.upstash.io https://*.pusher.com wss://*.pusher.com https://api.astralai.vercel.app; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://accounts.google.com; object-src 'none'; upgrade-insecure-requests;"
    )

    return response
  },
  {
    callbacks: {
      authorized: () => true // Allow all to pass into proxy function for manual handling
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET
  }
)

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
}
