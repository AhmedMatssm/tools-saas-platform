import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const revalidate = 60 // ISR: refresh stats every 60 seconds

export async function GET() {
  try {
    const [totalUsers, totalGenerations, totalBlogs] = await Promise.all([
      (prisma as any).user.count({ where: { role: "USER" } }),  // exclude admins
      (prisma as any).generation.count(),
      (prisma as any).blog.count({ where: { published: true } }),
    ])

    return NextResponse.json({
      totalUsers,
      totalGenerations,
      totalBlogs,
    })
  } catch (error) {
    console.error("STATS_ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
