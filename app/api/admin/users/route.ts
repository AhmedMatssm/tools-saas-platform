import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("ADMIN_USERS_ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
