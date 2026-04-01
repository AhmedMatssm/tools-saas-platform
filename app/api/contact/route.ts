import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Strict Rate Limiting implementation using isolated Memory map 
const rlMap = new Map<string, { count: number, resetAt: number }>()

const contactSchema = z.object({
  name: z.string().min(2, "Name very short").max(50),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3).max(100),
  message: z.string().min(5, "Minimum 5 chars").max(3000, "Too long"),
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()

    // Rate Limiter: 5 requests per 10 minutes max
    if (rlMap.has(ip)) {
      const record = rlMap.get(ip)!
      if (now > record.resetAt) {
        rlMap.set(ip, { count: 1, resetAt: now + 600000 })
      } else {
        if (record.count >= 5) return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 })
        record.count++
      }
    } else {
      rlMap.set(ip, { count: 1, resetAt: now + 600000 })
    }

    const body = await req.json()
    const validated = contactSchema.parse(body)

    // Security: Automatically parameterized queries protecting from SQL injections
    await (prisma as any).userQuestion.create({
      data: {
        name: validated.name,
        email: validated.email,
        question: `[SUBJECT: ${validated.subject}] \n\n${validated.message}`,
        source: "CONTACT_FORM",
        ip
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    return NextResponse.json({ error: "Unexpected security restriction." }, { status: 500 }) 
  }
}
