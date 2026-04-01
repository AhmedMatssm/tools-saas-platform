import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

/**
 * GET /api/admin/analytics/visitors
 * Returns aggregated visitor counts for the admin dashboard.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [total, today, weekly] = await Promise.all([
      (prisma as any).visitor.count(),
      (prisma as any).visitor.count({
        where: { createdAt: { gte: todayStart } }
      }),
      (prisma as any).visitor.count({
        where: { createdAt: { gte: weekStart } }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalVisitors: total,
        todayVisitors: today,
        weeklyVisitors: weekly
      }
    })

  } catch (error) {
    console.error("[ADMIN_VISITORS_ANALYTICS_ERROR]:", error)
    return NextResponse.json({ error: "Failed to aggregate spectral traffic" }, { status: 500 })
  }
}
