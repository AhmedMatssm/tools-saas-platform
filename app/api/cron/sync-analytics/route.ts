import { NextRequest, NextResponse } from "next/server"
import { syncRedisAnalyticsToDB } from "@/services/analytics.service"

/**
 * CRON JOB: /api/cron/sync-analytics
 * 
 * Should be called by Vercel Cron (or any scheduler) every 5-15 mins.
 * Transfers analytics data from high-speed Redis buffer to PostgreSQL in batches.
 */
export async function GET(req: NextRequest) {
  // 1. Basic security check (Secret header)
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const processedCount = await syncRedisAnalyticsToDB()
    
    return NextResponse.json({ 
      success: true, 
      processed: processedCount,
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    console.error("[CRON_SYNC_ERROR]:", err)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
