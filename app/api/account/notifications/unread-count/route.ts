import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
       return NextResponse.json({ count: 0 }, { status: 401 })
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("[UNREAD_COUNT_ERROR]:", error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
