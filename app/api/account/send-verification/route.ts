import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { sendEmail } from "@/services/mail.service"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Missing spectral mail parameter." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // We return success even if user not found to prevent email enumeration attacks
      return NextResponse.json({ success: true })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Identity already verified." }, { status: 400 })
    }

    // Delete existing tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Create new token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    })

    // Dispatch mail
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
    
    await sendEmail({
      to: email,
      subject: "Aura Network - Verify Your Identity",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 24px; font-weight: bold; font-style: italic; color: #3b82f6;">Aura Network</div>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 16px;">Manifest Your Spectral Identity</h2>
          <p style="text-align: center; font-size: 14px; opacity: 0.9; margin-bottom: 32px;">Please confirm your connection to our network by verifying your email address.</p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; display: inline-block;">Verify Connection</a>
          </div>
          <p style="font-size: 11px; opacity: 0.5; margin-top: 32px; text-align: center;">Or manually paste this uplink: <br/><a href="${verifyUrl}" style="color: #60a5fa;">${verifyUrl}</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]:", error)
    return NextResponse.json({ error: "Failed to dispatch verification transmission." }, { status: 500 })
  }
}
