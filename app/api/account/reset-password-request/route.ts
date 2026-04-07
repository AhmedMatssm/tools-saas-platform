import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import crypto from "crypto"

const resetSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = resetSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Security: Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Generate Verification Token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour

    // NOTE: Using type assertion due to stale IDE linting after schema update
    const p = prisma as any
    await p.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      }
    })


    // TODO: Use a dedicated email provider (Resend, SendGrid) to send this link now that the notification system is removed
    console.log(`[PASS_RESET_REMOVED]: Link for ${email}: ${process.env.NEXTAUTH_URL}/reset-password/confirm?token=${token}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("[RESET_PASSWORD_ERROR]:", error)
    return NextResponse.json({ error: "Failed to dispatch recovery link." }, { status: 500 })
  }
}

