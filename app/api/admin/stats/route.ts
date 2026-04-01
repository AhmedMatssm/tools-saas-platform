import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    
    // Check if session exists and role is ADMIN
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied: Admin only." }, { status: 403 })
    }

    const [userCount, genCount, blogCount, commentCount, likeCount, savedCount] = await Promise.all([
      prisma.user.count(),
      (prisma as any).generation.count(),
      (prisma as any).blog.count(),
      (prisma as any).comment.count(),
      (prisma as any).postLike.count(),
      (prisma as any).savedPost.count()
    ])

    const recentGenerations = await (prisma as any).generation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userCount,
        totalGenerations: genCount,
        totalBlogs: blogCount,
        totalComments: commentCount,
        totalLikes: likeCount,
        totalSaved: savedCount
      },
      recentGenerations
    })
  } catch (error) {
    console.error("ADMIN_STATS_ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
