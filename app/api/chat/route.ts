import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

// Memory Rate Limiter strictly isolating IP blocks targeting /api/chat Abuse (10 queries/min limit)
const chatLimiter = new Map<string, { count: number, resetAt: number }>()

const chatSchema = z.object({
  message: z.string().min(2, "Invalid payload.").max(500, "Message length exceeded system threshold."),
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()

    // 1. Strict Spam Prevention Guard
    if (chatLimiter.has(ip)) {
      const record = chatLimiter.get(ip)!
      if (now > record.resetAt) {
        chatLimiter.set(ip, { count: 1, resetAt: now + 60000 })
      } else {
        if (record.count >= 10) return NextResponse.json({ error: "Rate Limit Exceeded. Cool down protocol active." }, { status: 429 })
        record.count++
      }
    } else {
      chatLimiter.set(ip, { count: 1, resetAt: now + 60000 })
    }

    const body = await req.json()
    const { message } = chatSchema.parse(body)

    // 2. Prevent prompt-injection/XSS techniques by hard-sanitizing control characters
    const sanitizedQuery = message.replace(/[<>{}$]/g, "")
    const sqLower = sanitizedQuery.toLowerCase()

    // 3. Database Search Phase
    const [faqs, docs, history] = await Promise.all([
      (prisma as any).faq.findMany({
         where: { isPublished: true, OR: [{ question: { contains: sanitizedQuery, mode: 'insensitive' } }, { answer: { contains: sanitizedQuery, mode: 'insensitive' } }] }, take: 4
      }),
      (prisma as any).supportDoc.findMany({
         where: { isPublished: true, OR: [{ question: { contains: sanitizedQuery, mode: 'insensitive' } }, { answer: { contains: sanitizedQuery, mode: 'insensitive' } }] }, take: 2
      }),
      (prisma as any).userQuestion.findMany({
         where: { isResolved: true, answer: { not: null }, OR: [{ question: { contains: sanitizedQuery, mode: 'insensitive' } }] }, take: 2
      }),
    ])

    // Direct Match Resolution (Hybrid Route A)
    const directMatch = 
      faqs.find((f: any) => f.question.toLowerCase().includes(sqLower)) ||
      docs.find((d: any) => d.question.toLowerCase().includes(sqLower)) ||
      history.find((h: any) => h.question.toLowerCase().includes(sqLower))

    if (directMatch) {
       // High confidence database match -> Skip AI cost entirely
       const logged = await (prisma as any).userQuestion.create({
          data: { question: sanitizedQuery, answer: directMatch.answer, source: "CHATBOT_DIRECT", isResolved: true, ip }
       })
       return NextResponse.json({ reply: directMatch.answer, logId: logged.id })
    }

    // Partial Context Mapping for AI Fallback
    const contextArr: string[] = []
    faqs.forEach((f: any) => contextArr.push(`Q: ${f.question}\nA: ${f.answer}`))
    docs.forEach((d: any) => contextArr.push(`Q: ${d.question}\nA: ${d.answer}`))
    history.forEach((h: any) => contextArr.push(`Q: ${h.question}\nA: ${h.answer}`))
    const context = contextArr.join("\n\n")

    // 4. Query the AI Logic Cloud backend (Hybrid Route B using Cybertron)
    let aiResponse = ""
    try {
      if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
        const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@hf/google/gemma-7b-it`
        
        const messages = [
          { 
            role: "system", 
            content: "You are an AI assistant for Astral AI platform. Answer clearly and helpfully. If the question is about pricing, plans, or features, use this info:\n- Free plan: 5 images\n- Pro plan: unlimited images for $10\n- To change plan: go to Settings > Billing\n\nIf you don't know the answer, say you are not sure and suggest contacting support."
          }
        ]

        if (contextArr.length > 0) {
           messages.push({ role: "system", content: "Context:\n" + context })
        }

        messages.push({ role: "user", content: sanitizedQuery })

        const aiReq = await fetch(url, {
           method: "POST",
           headers: {
             Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
             "Content-Type": "application/json"
           },
           body: JSON.stringify({ messages })
        })

        const aiData = await aiReq.json()
        if (aiData.success && aiData.result?.response) {
           aiResponse = aiData.result.response.trim()
        } else {
           console.error("AI_RAG_FAILURE:", aiData)
           aiResponse = "Cloudflare Engine experienced a connection anomaly. Please contact support."
        }
      } else {
         // Token missing local sandbox fallback
         aiResponse = "I am not sure of the required contexts currently. Please contact support via the Secure Forms dashboard directly."
      }
    } catch (aiRuntimeError) {
      console.error("AI_RUNTIME_ERROR:", aiRuntimeError)
      return new Response(JSON.stringify({ error: "AI Error", details: "Failed connecting to Cybertron engine." }), { status: 500, headers: {'Content-Type': 'application/json'} })
    }

    // 5. Log the AI fallback interaction properly flagging it for Admin Review
    const logged = await (prisma as any).userQuestion.create({
       data: { question: sanitizedQuery, answer: aiResponse, source: "CHATBOT_AI", isResolved: false, ip } // Mark unresolved so admins review AI behaviors
    })
    
    return NextResponse.json({ reply: aiResponse, logId: logged.id })

  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
    console.error("RAG_EXCEPTION", error)
    return NextResponse.json({ error: "Execution environment failure." }, { status: 500 })
  }
}

