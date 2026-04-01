import prisma from "@/lib/prisma"
import { createHash } from "crypto"

/**
 * Privacy-first visitor tracking.
 * Hashes the IP address with a secret salt to avoid storing raw PII.
 */
export function hashIP(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || "astral_spectral_salt_2024"
  return createHash("sha256").update(ip + salt).digest("hex")
}

export async function trackVisitor(ip: string, userAgent: string | null, path: string) {
  try {
    const p = prisma as any
    // Safety check for unsynchronized Prisma Client (e.g. dev server lock)
    if (!p.visitor) {
      console.warn(`[ANALYTICS_SYNC_ERROR] Skip tracking: Visitor model not found in Prisma client. Path: ${path}`)
      return
    }

    const ipHash = hashIP(ip)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 1. Check if this unique visitor was already logged in the last 24h
    let visitor = await p.visitor.findFirst({
      where: {
        ipHash,
        createdAt: { gte: twentyFourHoursAgo }
      }
    })

    // 2. If new visitor in this window, create record
    if (!visitor) {
      visitor = await (prisma as any).visitor.create({
        data: {
          ipHash,
          userAgent: userAgent?.substring(0, 255) || "Unknown"
        }
      })
      console.log(`[ANALYTICS] New visitor manifestation: ${ipHash.substring(0, 8)}...`)
    }

    // 3. Log the specific page view (always, or throttle if needed)
    await (prisma as any).pageView.create({
      data: {
        visitorId: visitor.id,
        path: path.substring(0, 255)
      }
    })

  } catch (error) {
    console.error("[ANALYTICS_TRACKING_ERROR]:", error)
  }
}
