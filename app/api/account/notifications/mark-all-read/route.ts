import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { markAllAsRead } from "@/services/notifications.service"

export async function POST() {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await markAllAsRead(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MARK_ALL_READ_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
