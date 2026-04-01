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

    // ── 1. Fetch Real Visitor History ──────────────────
    const visitors = await (prisma as any).visitor.findMany({
      where: { createdAt: { gte: startDate } },
      select: { ipHash: true, userAgent: true, createdAt: true },
    })

    // ── 2. Group by Day ────────────────────────────────
    const dailyVisits = visitors.reduce((acc: any, curr: any) => {
      const date = curr.createdAt.toISOString().split("T")[0]
      if (!acc[date]) acc[date] = { unique: new Set(), desktop: 0, mobile: 0 }
      
      acc[date].unique.add(curr.ipHash)
      const isMobile = curr.userAgent?.toLowerCase().includes("mobile")
      if (isMobile) acc[date].mobile++
      else acc[date].desktop++
      
      return acc
    }, {})

    // ── 3. Build Timeline ─────────────────────────────
    const trafficData = []
    let totalUnique = new Set()
    let totalDesktop = 0
    let totalMobile = 0
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      
      const dayData = dailyVisits[dateStr]
      const uniqueVisits = dayData?.unique.size || 0
      
      trafficData.push({
        name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: dateStr,
        visitors: uniqueVisits,
        pageViews: uniqueVisits * 5 // Estimated engagement multiplier
      })
      
      if (dayData) {
        dayData.unique.forEach((hash: string) => totalUnique.add(hash))
        totalDesktop += dayData.desktop
        totalMobile += dayData.mobile
      }
    }

    // ── 4. Calculate Final Stats ──────────────────────
    const totalHits = totalDesktop + totalMobile
    const stats = {
      totalVisitors: trafficData.reduce((acc, curr) => acc + curr.visitors, 0),
      uniqueVisitors: totalUnique.size,
      desktopPercentage: totalHits > 0 ? Math.round((totalDesktop / totalHits) * 100) : 100,
      mobilePercentage: totalHits > 0 ? Math.round((totalMobile / totalHits) * 100) : 0
    }

    return NextResponse.json({
      success: true,
      data: trafficData,
      stats
    })
  } catch (error) {
    console.error("ANALYTICS_TRAFFIC_ERR:", error)
    return NextResponse.json({ error: "Failed to fetch traffic analytics" }, { status: 500 })
  }
}
