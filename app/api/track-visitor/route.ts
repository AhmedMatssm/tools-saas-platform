import { NextRequest, NextResponse } from "next/server"
import { trackVisitorBuffered } from "@/services/analytics.service"
import redis from "@/lib/redis"

/**
 * PRODUCTION-READY: POST /api/track-visitor
 * 
 * Includes:
 * 1. IP-based Rate Limiting (Redis window)
 * 2. Non-blocking Redis Buffering for High Throughput
 * 3. Database decoupling
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
  const rateLimitKey = `ratelimit:visitor:${ip}`
  const limit = 30 // max hits per 60s window
  const windowSeconds = 60

  try {
    // 1. IP Rate Limiting (Directly in Redis, very fast)
    const currentHits = await redis.incr(rateLimitKey)
    if (currentHits === 1) {
      await redis.expire(rateLimitKey, windowSeconds)
    }

    if (currentHits > limit) {
      // Quietly drop spammed analytics requests
      return NextResponse.json({ error: "Throttled" }, { status: 429 })
    }

    // 2. Extract context
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const { path } = await req.json()

    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 })

    // 3. Buffer visit in Redis (Fast-track)
    // We don't await the tracking to further speed up response, though IORedis return is fast
    trackVisitorBuffered(ip, userAgent, path).catch(err => {
      console.error("[ANALYTICS_TRACK_CRASH]:", err)
    })

    return NextResponse.json({ success: true, mode: "buffered" })

  } catch (err) {
    console.error("[TRACK_VISITOR_API_CRITICAL_FAIL]:", err)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
