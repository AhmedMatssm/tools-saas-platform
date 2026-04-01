import { NextRequest, NextResponse } from "next/server"
import { trackVisitor } from "@/lib/analytics"

/**
 * POST /api/track-visitor
 * Explicitly track a visitor. Used by middleware or client.
 * Non-blocking by nature (Next.js server-side) but handles errors.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const { path } = await req.json()

    if (!path) return NextResponse.json({ error: "No path" }, { status: 400 })

    // Async call to ensure response isn't blocked
    trackVisitor(ip, userAgent, path).catch(err => {
      console.error("[TRACK_VISITOR_API_CRASH]:", err)
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
