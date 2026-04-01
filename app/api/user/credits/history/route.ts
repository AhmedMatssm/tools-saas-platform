import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

/**
 * GET /api/user/credits/history
 * Returns the authenticated user's credit audit log.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // ── Check if Model is synchronized ────────────────
    const p = prisma as any
    if (!p.creditHistory) {
      console.error("[API_AUDIT_LOG_ERROR]: CreditHistory model not found in Prisma client.")
      return NextResponse.json({
        error: "Spectral Synchronization Incomplete. Please run 'npx prisma generate' and restart your dev server.",
        syncStatus: "FAILED"
      }, { status: 503 })
    }

    const [history, total] = await Promise.all([
      p.creditHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      p.creditHistory.count({
        where: { userId: session.user.id }
      })
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
    console.error("[CREDIT_HISTORY_ERROR]:", error)
    return NextResponse.json({ error: "Failed to fetch credit history" }, { status: 500 })
  }
}
