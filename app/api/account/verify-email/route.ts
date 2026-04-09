import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json()

    if (!token || !email) {
      return NextResponse.json({ error: "Missing identity attributes." }, { status: 400 })
    }

    // Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired spectral token." }, { status: 400 })
    }

    if (new Date() > new Date(verificationToken.expires)) {
      // Delete expired token to clean up
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          }
        }
      })
      return NextResponse.json({ error: "Token has faded. Please request a new one." }, { status: 400 })
    }

    // Mark user as verified atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() }
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          }
        }
      })
    ])

    return NextResponse.json({ success: true, message: "Spectral identity manifested successfully." })
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]:", error)
    return NextResponse.json({ error: "Failed to verify identity." }, { status: 500 })
  }
}
