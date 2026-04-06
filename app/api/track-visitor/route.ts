import { NextRequest, NextResponse } from "next/server"
import { trackVisitorBuffered } from "@/services/analytics.service"
import redis from "@/lib/redis"

/**
 * PUBLIC: Track visitor page-view without direct DB impact.
 * Uses Redis for buffering and sliding-window rate limiting.
 */
export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json()
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"

    // ── 0. RATE LIMITING (Sliding Window in Redis) ──
    const limit = 20 // Max 20 hits per minute
    const key = `ratelimit:visitor:${ip}`
    const currentHits = await redis.incr(key)
    if (currentHits === 1) await redis.expire(key, 60)

    if (currentHits > limit) {
      return NextResponse.json({ error: "Too many manifestations." }, { status: 429 })
    }

    // ── 1. BUFFERED TRACKING ──
    // Non-blocking: doesn't use Postgres pool
    trackVisitorBuffered(ip, userAgent, path)

    return NextResponse.json({ success: true, mode: "AURA_BUFFERED" })
  } catch (error) {
    // Fail silently on analytics so the main app keeps working
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
