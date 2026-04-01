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
    const days = parseInt(searchParams.get("days") || "7")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const rawData = await (prisma as any).generation.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true }
    })

    const grouped = rawData.reduce((acc: any, curr: any) => {
      const date = curr.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const result = []
    let totalGenerations = 0
    let trend = 0 // Basic trend mock

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const currTotal = grouped[dateStr] || 0
      totalGenerations += currTotal
      
      result.push({
        name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: dateStr,
        total: currTotal
      })
    }

    // Rough trend logic (second half vs first half)
    const half = Math.floor(result.length / 2)
    const firstHalf = result.slice(0, half).reduce((sum, r) => sum + r.total, 0)
    const secondHalf = result.slice(half).reduce((sum, r) => sum + r.total, 0)
    if (firstHalf > 0) trend = ((secondHalf - firstHalf) / firstHalf) * 100

    return NextResponse.json({ 
      success: true, 
      data: result,
      summary: { total: totalGenerations, trend: parseFloat(trend.toFixed(1)) }
    })
  } catch (error) {
    console.error("ANALYTICS_GEN_ERR:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
