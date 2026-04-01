import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const hasUserId = searchParams.get("userId")

    const where: any = {}
    
    if (search) {
      where.prompt = { contains: search, mode: "insensitive" }
    }
    if (hasUserId) {
      where.userId = hasUserId
    }

    const [total, generationsRaw] = await Promise.all([
      (prisma as any).generation.count({ where }),
      (prisma as any).generation.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      generations: generationsRaw,
      pagination: { total, pages: Math.ceil(total / limit), page }
    })
  } catch (error) {
    console.error("ADMIN_GENTABLE_ERR:", error)
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 })
  }
}
