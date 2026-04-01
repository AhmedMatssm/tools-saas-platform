import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateImage } from "@/lib/cloudflare_ai"
import { getServerAuthSession } from "@/lib/auth"
import { rateLimit, sanitizeInput } from "@/lib/rate-limit"
import { z } from "zod"
import { logCreditChange } from "@/lib/credits"

// ── Input schema ───────────────────────────────────────────────
const generateSchema = z.object({
  prompt: z.string().min(3, "Prompt too short").max(500, "Prompt exceeds 500 characters"),
  model: z.enum(["fast", "quality", "creative"]).default("fast"),
})

// ── Daily refill config ────────────────────────────────────────
const DAILY_REFILL_AMOUNT = 5
const MAX_CREDITS = 30
const REFILL_INTERVAL_HOURS = 24

export async function POST(req: NextRequest) {
  try {
    // ── 1. AUTHENTICATION (server-side only) ───────────────────
    const session = await getServerAuthSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to generate images." },
        { status: 401 }
      )
    }

    // ── 2. RATE LIMITING (per user, 20 requests / minute) ──────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const rateLimitKey = `generate:${session.user.id}`
    const { allowed, remaining } = rateLimit(rateLimitKey, { max: 20, windowMs: 60_000 })

    if (!allowed) {
      console.warn(`[RATE_LIMIT] User ${session.user.id} exceeded generation rate limit`)
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before generating again." },
        { status: 429 }
      )
    }

    // ── 3. INPUT VALIDATION & SANITIZATION ─────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const prompt = sanitizeInput(parsed.data.prompt)
    const model = parsed.data.model

    if (!prompt) {
      return NextResponse.json({ error: "Prompt cannot be empty after sanitization" }, { status: 400 })
    }

    // ── 4. FETCH USER FROM DB (never trust JWT for credits) ─────
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { id: true, credits: true, lastRefill: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 })
    }

    // ── 5. ADMIN BYPASS ─────────────────────────────────────────
    const isAdmin = user.role === "ADMIN"

    if (!isAdmin) {
      // ── 5a. DAILY CREDIT REFILL (server-side only) ───────────
      const now = new Date()
      const lastRefill = new Date(user.lastRefill)
      const hoursSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60)

      if (hoursSinceRefill >= REFILL_INTERVAL_HOURS) {
        const refilled = Math.min(user.credits + DAILY_REFILL_AMOUNT, MAX_CREDITS)
        await (prisma as any).user.update({
          where: { id: user.id },
          data: { credits: refilled, lastRefill: now }
        })

        // NEW: Log refill
        await logCreditChange(null, user.id, DAILY_REFILL_AMOUNT, "REFILL", "Automatic 24h spectral refill")

        user.credits = refilled
        console.log(`[CREDITS] Refilled ${DAILY_REFILL_AMOUNT} credits for user ${user.id}. New balance: ${refilled}`)
      }

      // ── 5b. CREDIT CHECK ─────────────────────────────────────
      if (user.credits <= 0) {
        return NextResponse.json(
          { error: "No credits remaining. Your credits refill every 24 hours." },
          { status: 403 }
        )
      }
    }

    // ── 6. GENERATE IMAGE (with timeout protection) ────────────
    let imageData: Buffer
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000) // 30s timeout

      imageData = await generateImage({ prompt, model })
      clearTimeout(timeout)
    } catch (genErr: any) {
      if (genErr?.name === "AbortError") {
        console.error(`[GEN_TIMEOUT] User ${user.id} - prompt timed out`)
        return NextResponse.json({ error: "Image generation timed out. Please try again." }, { status: 504 })
      }
      console.error(`[GEN_ERROR] User ${user.id}:`, genErr?.message)
      return NextResponse.json({ error: "Image generation failed. Please try again." }, { status: 502 })
    }

    const base64Image = `data:image/png;base64,${imageData.toString("base64")}`

    // ── 7. ATOMIC CREDIT DEDUCTION + PERSIST (in transaction) ──
    const [generation] = await (prisma as any).$transaction([
      (prisma as any).generation.create({
        data: {
          prompt,
          imageUrl: base64Image,
          ip,
          userId: user.id,
        }
      }),
      ...(isAdmin ? [] : [
        (prisma as any).user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } }
        }),
        (prisma as any).creditHistory.create({
          data: {
            userId: user.id,
            amount: -1,
            type: "USAGE",
            description: `Manifested: ${prompt.substring(0, 30)}...`
          }
        })
      ])
    ])

    // ── 8. LOG ATTEMPT ─────────────────────────────────────────
    console.log(`[GEN_SUCCESS] User: ${user.id} | Model: ${model} | Credits left: ${isAdmin ? "∞" : user.credits - 1}`)

    return NextResponse.json({
      success: true,
      imageUrl: base64Image,
      generationId: generation.id,
      creditsRemaining: isAdmin ? null : user.credits - 1,
    })

  } catch (error: any) {
    // Never expose internal error details to client
    console.error("[GEN_UNHANDLED_ERROR]:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
