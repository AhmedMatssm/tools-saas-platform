import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { markAsRead, deleteNotification } from "@/services/notifications.service"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await markAsRead(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MARK_READ_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await deleteNotification(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
