import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const history = await (prisma as any).generation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, prompt: true, imageUrl: true, createdAt: true }
    })

    return NextResponse.json({ success: true, history })
  } catch (error) {
    console.error("HISTORY_GET_ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: { id?: string; deleteAll?: boolean }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { id, deleteAll } = body

    if (deleteAll) {
      await (prisma as any).generation.deleteMany({
        where: { userId: session.user.id }
      })
      return NextResponse.json({ success: true, message: "History cleared" })
    }

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Valid ID required" }, { status: 400 })
    }

    // Ownership check: only delete if record belongs to the authenticated user
    const record = await (prisma as any).generation.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    await (prisma as any).generation.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Record deleted" })
  } catch (error) {
    console.error("HISTORY_DELETE_ERROR:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}
