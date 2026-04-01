import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const [totalUsers, adminsCount, totalLogins] = await Promise.all([
      (prisma as any).user.count(),
      (prisma as any).user.count({ where: { role: "ADMIN" } }),
      (prisma as any).loginHistory.count()
    ])

    // Find top users by generation usage
    const topUsersRaw = await (prisma as any).user.findMany({
      take: 10,
      select: {
        id: true, name: true, email: true, plan: true,
        _count: { select: { generations: true, logins: true } }
      },
      orderBy: {
        generations: { _count: "desc" }
      }
    })

    // Formatting for frontend chart or table lists
    const topUsers = topUsersRaw.map((u: any) => ({
      id: u.id,
      name: u.name || "Unknown User",
      email: u.email,
      plan: u.plan,
      generations: u._count.generations,
      logins: u._count.logins,
    }))

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        adminsCount,
        totalSessionsTracker: totalLogins,
      },
      topUsers
    })
  } catch (error) {
    console.error("ANALYTICS_USERS_ERR:", error)
    return NextResponse.json({ error: "Failed to fetch user analytics" }, { status: 500 })
  }
}
