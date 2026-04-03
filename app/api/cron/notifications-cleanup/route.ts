import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { subDays } from "date-fns"

/**
 * AUTOMATIC RETENTION POLICY
 * Deletes notifications older than 90 days.
 */
export async function GET(req: Request) {
  // 1. Security Check: Ensure CRON_SECRET is present (standard for Vercel/GitHub Actions)
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const cutoff = subDays(new Date(), 90)

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
      },
    })

    console.log(`[RETENTION_POLICY]: Cleaned up ${result.count} old notifications.`)
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count 
    })
  } catch (error) {
    console.error("[RETENTION_POLICY_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
