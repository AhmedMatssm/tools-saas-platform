import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

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
    const existingUser = await (prisma as any).user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Atomically create user and reward referrer
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // 1. Create new user with 10 credits (default in schema)
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          credits: 10, // Ensure they start with 10
        }
      })

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
