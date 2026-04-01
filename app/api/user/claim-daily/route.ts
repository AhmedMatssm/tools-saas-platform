import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

const DAILY_REWARD = 1
const CLAIM_INTERVAL_HOURS = 24

/**
 * POST /api/user/claim-daily
 * Awards +1 credit every 24 hours.
 * Fully server-side — cannot be triggered by client manipulation.
 */
export async function POST() {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { id: true, credits: true, lastClaim: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const lastClaim = user.lastClaim ? new Date(user.lastClaim) : null
    const hoursSince = lastClaim ? (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60) : 25 

    if (lastClaim && hoursSince < CLAIM_INTERVAL_HOURS) {
      const nextClaimMs = lastClaim.getTime() + CLAIM_INTERVAL_HOURS * 60 * 60 * 1000
      return NextResponse.json({
        error: "Energy already claimed. Please wait until your next resonance.",
        nextClaimAt: new Date(nextClaimMs).toISOString(),
      }, { status: 429 })
    }

    const updated = await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        credits: { increment: DAILY_REWARD },
        lastClaim: now,
      },
      select: { credits: true }
    })

    console.log(`[DAILY_REWARD] User ${user.id} claimed +${DAILY_REWARD} credit. New balance: ${updated.credits}`)

    return NextResponse.json({
      success: true,
      creditsAwarded: DAILY_REWARD,
      newBalance: updated.credits,
    })

  } catch (error) {
    console.error("CLAIM_DAILY_ERROR:", error)
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 })
  }
}
