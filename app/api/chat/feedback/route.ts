import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
     const { logId, faqId, helpful } = await req.json()
     
     if (logId) {
        // Safely update the logged UserQuestion with the boolean feedback
        await (prisma as any).userQuestion.update({ 
           where: { id: logId }, 
           data: { helpful: Boolean(helpful) }
        })
        return NextResponse.json({ success: true })
     }

     if (faqId) {
        // FAQ direct UI feedback: Log a new UserQuestion representing this static interaction
        const faq = await (prisma as any).faq.findUnique({ where: { id: faqId } })
        if (faq) {
           await (prisma as any).userQuestion.create({
              data: {
                 source: "FAQ_FEEDBACK",
                 question: faq.question,
                 answer: faq.answer,
                 isResolved: true,
                 helpful: Boolean(helpful),
                 ip: req.headers.get("x-forwarded-for") || "unknown"
              }
           })
        }
        return NextResponse.json({ success: true })
     }
     
     return NextResponse.json({ error: "Missing tracking identifiers." }, { status: 400 })
  } catch (error) {
     console.error("FEEDBACK_ERROR", error)
     return NextResponse.json({ error: "Failed to pipe analytics loop securely." }, { status: 500 })
  }
}
