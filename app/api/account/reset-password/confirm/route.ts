import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const confirmResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = confirmResetSchema.parse(body)

    // 1. Verify Token
    const verificationToken = await (prisma as any).verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired recovery link." }, { status: 400 })
    }

    // 2. Check Expiration
    if (new Date() > verificationToken.expires) {
      await (prisma as any).verificationToken.delete({ where: { token } })
      return NextResponse.json({ error: "This recovery link has expired. Please request a new one." }, { status: 400 })
    }

    // 3. Update User Password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    await (prisma as any).user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    })

    // 4. Cleanup: Delete used token
    await (prisma as any).verificationToken.delete({
      where: { token }
    })

    return NextResponse.json({ success: true, message: "Password updated successfully. You can now log in." })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("[CONFIRM_RESET_ERROR]:", error)
    return NextResponse.json({ error: "Internal network error during password update." }, { status: 500 })
  }
}
