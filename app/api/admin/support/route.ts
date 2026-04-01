import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"
import { z } from "zod"
import xss from "xss" // Secure Content Filtering

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "Question must be at least 5 chars."),
  answer: z.string().min(10, "Answer detailed payload is missing."),
  category: z.string().min(2),
  isPublished: z.boolean().default(true)
})

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized Intrusion Blocked." }, { status: 403 })

    const [faqs, docs, questions] = await Promise.all([
      (prisma as any).faq.findMany({ orderBy: { createdAt: "desc" } }),
      (prisma as any).supportDoc.findMany({ orderBy: { createdAt: "desc" } }),
      (prisma as any).userQuestion.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    ])

    return NextResponse.json({ success: true, faqs, docs, questions })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal DB failure." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized Intrusion Blocked." }, { status: 403 })

    const body = await req.json()
    const { action, payload } = body

    if (action === "UPSERT_FAQ") {
       const v = faqSchema.parse(payload)
       v.question = xss(v.question) // Escape vectors
       v.answer = xss(v.answer)
       v.category = xss(v.category)
       
       if (v.id) {
         await (prisma as any).faq.update({ where: { id: v.id }, data: v })
       } else {
         await (prisma as any).faq.create({ data: v })
       }
       return NextResponse.json({ success: true })
    }

    if (action === "UPSERT_DOC") {
       const v = faqSchema.parse(payload)
       v.question = xss(v.question)
       v.answer = xss(v.answer)
       v.category = xss(v.category)
       
       if (v.id) await (prisma as any).supportDoc.update({ where: { id: v.id }, data: v })
       else await (prisma as any).supportDoc.create({ data: v })
       return NextResponse.json({ success: true })
    }

    if (action === "DELETE_DOC") {
       await (prisma as any).supportDoc.delete({ where: { id: payload.id } })
       return NextResponse.json({ success: true })
    }

    if (action === "DELETE_FAQ") {
       await (prisma as any).faq.delete({ where: { id: payload.id } })
       return NextResponse.json({ success: true })
    }

    if (action === "RESOLVE_QUESTION") {
       await (prisma as any).userQuestion.update({ where: { id: payload.id }, data: { isResolved: true } })
       return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Command not mapped." }, { status: 400 })

  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Secure Write Failed." }, { status: 500 })
  }
}
