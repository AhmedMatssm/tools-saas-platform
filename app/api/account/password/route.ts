import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "Password too long"),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = passwordSchema.parse(body)

    // Fetch the user with password
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password) {
      return NextResponse.json({ 
        error: "Your account uses OAuth sign-in (GitHub/Google). Password cannot be changed here." 
      }, { status: 400 })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Prevent using the same password
    const isSame = await bcrypt.compare(newPassword, user.password)
    if (isSame) {
      return NextResponse.json({ error: "New password must be different from your current password" }, { status: 400 })
    }

    // Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await (prisma as any).user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("PASSWORD_UPDATE_ERROR:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
