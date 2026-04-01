import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

/**
 * GET /api/admin/credits/history
 * Admin-only view of all credit logs across the platform.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "100")
    const skip = (page - 1) * limit
    const type = searchParams.get("type")

    const where: any = {}
    if (type) where.type = type

    const [history, total] = await Promise.all([
      (prisma as any).creditHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      (prisma as any).creditHistory.count({ where })
    ])

    return NextResponse.json({
      success: true,
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("[ADMIN_CREDIT_HISTORY_ERROR]:", error)
    return NextResponse.json({ error: "Portal access failed" }, { status: 500 })
  }
}
