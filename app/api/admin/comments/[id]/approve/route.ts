import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { id } = await params
    await (prisma as any).comment.update({
      where: { id },
      data: { status: "APPROVED" }
    })
    return NextResponse.json({ message: "Comment approved" })
  } catch (err) {
    return NextResponse.json({ error: "Failed to approve comment" }, { status: 500 })
  }
}
