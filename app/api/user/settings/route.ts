import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true, credits: true, billingCycle: true, apiKey: true,
        twoFactorEnabled: true, language: true, theme: true, emailAlerts: true,
        logins: { take: 5, orderBy: { createdAt: "desc" } },
        generations: { take: 5, orderBy: { createdAt: "desc" }, select: { id: true, prompt: true, imageUrl: true, createdAt: true } }
      }
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const body = await req.json()
    const { action, payload } = body

    if (action === "GENERATE_API_KEY") {
      const newKey = "sk-live-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      await (prisma as any).user.update({ where: { id: session.user.id }, data: { apiKey: newKey } })
      return NextResponse.json({ success: true, apiKey: newKey })
    }

    if (action === "REVOKE_API_KEY") {
      await (prisma as any).user.update({ where: { id: session.user.id }, data: { apiKey: null } })
      return NextResponse.json({ success: true })
    }

    if (action === "UPDATE_PREFS") {
      // Whitelist allowed fields — NEVER trust raw payload from client
      const allowed = ["language", "theme", "emailAlerts"] as const
      const safePayload: Record<string, unknown> = {}
      for (const key of allowed) {
        if (key in payload) safePayload[key] = payload[key]
      }
      if (Object.keys(safePayload).length === 0) {
        return NextResponse.json({ error: "No valid fields provided" }, { status: 400 })
      }
      await (prisma as any).user.update({ where: { id: session.user.id }, data: safePayload })
      return NextResponse.json({ success: true })
    }

    if (action === "DELETE_ACCOUNT") {
      const { password } = payload
      const user = await (prisma as any).user.findUnique({ where: { id: session.user.id } })
      if (!user?.password) return NextResponse.json({ error: "Invalid account state" }, { status: 400 })
      
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) return NextResponse.json({ error: "Incorrect password" }, { status: 400 })

      // Standard cascade delete handles children (generations, saved images, usage, logins)
      await (prisma as any).user.delete({ where: { id: session.user.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error: any) {
    console.error("USER_SETTINGS_ERROR:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
