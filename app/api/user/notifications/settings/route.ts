import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import { z } from "zod"

const settingsSchema = z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  successEnabled: z.boolean().optional(),
  errorEnabled: z.boolean().optional(),
  warningEnabled: z.boolean().optional(),
  creditEnabled: z.boolean().optional(),
  systemEnabled: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Fallback for logic safety & cleaner frontend (legacy users)
    const activeSettings = settings || {
      inAppEnabled: true,
      emailEnabled: true,
      successEnabled: true,
      errorEnabled: true,
      warningEnabled: true,
      creditEnabled: true,
      systemEnabled: true
    }

    return NextResponse.json({ success: true, settings: activeSettings })
  } catch (error) {
    console.error("[NOTIF_SETTINGS_GET_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = settingsSchema.parse(body)

    const settings = await (prisma as any).notificationSettings.upsert({
      where: { userId: session.user.id },
      update: validated,
      create: {
        userId: session.user.id,
        ...validated
      }
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    console.error("[NOTIF_SETTINGS_PATCH_ERROR]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
