import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import { logCreditChange } from "@/lib/credits"

/**
 * GET /api/user
 * Returns current authenticated user's profile including credits.
 * This is the single source of truth for credits in the frontend.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession()
    
    if (!session?.user?.id) {
      console.warn("[API_USER] Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id }
    })

    if (user) {
      // Safely delete sensitive data before returning
      delete user.password
    }

    if (!user) {
      console.error(`[API_USER] User not found: ${session.user.id}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ── AUTOMATIC 24H REFILL LOGIC ───────────────────────
    try {
      const DAILY_REFILL = 5
      const now = new Date()
      const last = new Date(user.lastRefill || user.createdAt)
      const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60)

      if (hoursSince >= 24) {
        const updated = await (prisma as any).user.update({
          where: { id: user.id },
          data: {
            credits: { increment: DAILY_REFILL },
            lastRefill: now
          },
          select: { credits: true }
        })
        
        // NEW: Log auto refill
        await logCreditChange(null, user.id, DAILY_REFILL, "REFILL", "Automatic daily 24h refill")

        user.credits = updated.credits
        console.log(`[AUTO_REFILL] User ${user.id} - credits refilled by ${DAILY_REFILL}. New: ${user.credits}`)
      }
    } catch (refillError) {
      console.error("[API_USER_REFILL_ERROR]:", refillError)
      // Don't fail the whole user fetch if refill fails
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("[API_USER_CRITICAL_ERROR]:", error)
    return NextResponse.json({ error: "Failed to fetch profile manifestation" }, { status: 500 })
  }
}
