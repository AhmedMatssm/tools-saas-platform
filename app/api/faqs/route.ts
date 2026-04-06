import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Cache FAQs for 12 hours
export const revalidate = 43200

export async function GET(req: Request) {
  try {
    const faqs = await (prisma as any).faq.findMany({ 
       where: { isPublished: true }, 
       orderBy: { createdAt: "desc" } 
    })
    return NextResponse.json({ success: true, faqs })
  } catch (error) {
    console.error("Public FAQ Error:", error)
    return NextResponse.json({ error: "Failed to load public FAQs." }, { status: 500 })
  }
}
