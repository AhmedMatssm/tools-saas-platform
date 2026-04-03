import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notifyMany } from "@/services/notifications.service"
import { z } from "zod"

const broadcastSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR", "CREDIT", "SYSTEM"]),
  target: z.enum(["all", "active"]), // "active" could be users active in last 30 days
})

/**
 * ADMIN ONLY BROADCAST
 * Sends a notification to all users or a subset.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession()
    const userRole = (session?.user as any)?.role

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access manifestation required." }, { status: 403 })
    }

    const body = await req.json()
    const { title, message, type, target } = broadcastSchema.parse(body)

    let users = []
    if (target === "all") {
       users = await prisma.user.findMany({ select: { id: true } })
    } else {
       // Example: users active in last 30 days
       const thirtyDaysAgo = new Date()
       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
       users = await prisma.user.findMany({
          where: { lastRefill: { gte: thirtyDaysAgo } },
          select: { id: true }
       })
    }

    const userIds = users.map((u: { id: string }) => u.id)
    
    // Asynchronous bulk delivery via BullMQ
    await notifyMany(userIds, { title, message, type })

    console.log(`[ADMIN_BROADCAST]: Triggered ${type} for ${userIds.length} users.`)

    return NextResponse.json({ 
       success: true, 
       sentTo: userIds.length 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten() }, { status: 400 })
    }
    console.error("[BROADCAST_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
