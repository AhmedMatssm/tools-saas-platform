import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { logCreditChange } from "@/services/credits.service"
import crypto from "crypto"
import { sendEmail } from "@/services/mail.service"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  referrerId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, referrerId } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Atomically create user and reward referrer
    await prisma.$transaction(async (tx) => {
      // 1. Create new user with 10 credits (default in schema)
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          credits: 10, // Ensure they start with 10
        }
      })

      // Create Verification Token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      })

      // Log initial credits for new user
      await logCreditChange(tx, newUser.id, 10, "REFILL", "Welcome Bonus - Initial Aura Manifested")

      // 2. If valid referrerId, reward the friend (+5 credits)
      if (referrerId) {
        try {
          const referrer = await tx.user.findUnique({ where: { id: referrerId } })
          if (referrer) {
            console.log(`[REFERRAL_REWARD] Awarding +5 to referrer: ${referrer.email}`)
            await tx.user.update({
              where: { id: referrerId },
              data: { credits: { increment: 5 } }
            })
            // Log credit change (this handles notifying the referrer)
            await logCreditChange(tx, referrerId, 5, "REWARD", `Referral Reward - Seeker ${name} joined`)
          } else {
            console.warn(`[REFERRAL_REWARD] Referrer with ID ${referrerId} not found.`)
          }
        } catch (e) {
          console.error("REFERRAL_CREDIT_ERROR:", e)
          // Don't fail the whole registration if referral fails
        }
      }
      
      return newUser
    })

    // Send Verification Email
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

    return NextResponse.json({
      success: true,
      message: "Aura manifestation successful. 10 credits awarded."
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid spectral input." }, { status: 400 })
    }
    console.error("REGISTRATION_ERROR:", error)
    return NextResponse.json({ error: "Spectral manifestation failed." }, { status: 500 })
  }
}
