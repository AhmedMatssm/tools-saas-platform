import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import { notifyUser } from "@/services/notifications.service"
import { z } from "zod"

const broadcastSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR", "SYSTEM"]).default("SYSTEM"),
})

/**
 * POST /api/admin/broadcast
 * Sends a notification to ALL users in the system.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, message, type } = broadcastSchema.parse(body)

    // Fetch all user IDs
    const users = await prisma.user.findMany({
      select: { id: true }
    })

    console.log(`[BROADCAST] Enqueueing ${users.length} notifications...`)
    const userIds = users.map(u => u.id)
    
    // Batch dispatch via Redis
    const { dispatchMany } = await import("@/services/notifications.service")
    await dispatchMany(userIds, "ADMIN_BROADCAST", { title, message, type })

    return NextResponse.json({ 
      success: true, 
      count: users.length,
      message: "Broadcast manifested across the network." 
    })
  } catch (error) {
    console.error("[ADMIN_BROADCAST_ERROR]:", error)
    return NextResponse.json({ error: "Failed to broadcast spectral alert." }, { status: 500 })
  }
}
