import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { id } = await params
    await (prisma as any).comment.delete({ where: { id } })
    return NextResponse.json({ message: "Comment deleted" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
