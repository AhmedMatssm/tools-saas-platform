import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  bio: z.string().max(300).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    const updated = await (prisma as any).user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
      },
      select: { id: true, name: true, email: true, role: true }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 })
    }
    console.error("ACCOUNT_UPDATE_ERROR:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
