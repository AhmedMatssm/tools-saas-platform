import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const lovedOnly = searchParams.get("lovedOnly") === "true"
    const skip = (page - 1) * limit

    const where = {
      imageUrl: { not: "" },
      ...(lovedOnly ? { isLoved: true } : {})
    }

    const [total, images] = await Promise.all([
      (prisma as any).generation.count({ where }),
      (prisma as any).generation.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          imageUrl: true,
          prompt: true,
          createdAt: true,
          isLoved: true,
          user: { select: { name: true } }
        }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      images, 
      pagination: { total, page, pages: Math.ceil(total / limit) } 
    })
  } catch (error) {
    console.error("COMMUNITY_API_ERR:", error)
    return NextResponse.json({ error: "Failed to fetch community images" }, { status: 500 })
  }
}
