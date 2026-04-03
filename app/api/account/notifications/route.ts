import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const querySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : 10)),
  filter: z.enum(["all", "unread", "read"]).optional().default("all"),
})

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const { page, limit, filter } = querySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      filter: searchParams.get("filter") ?? undefined,
    })

    const skip = (page - 1) * limit

    const where: any = { userId: session.user.id }
    if (filter === "unread") where.isRead = false
    if (filter === "read") where.isRead = true

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
