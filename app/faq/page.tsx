import prisma from "@/lib/prisma"
import { Metadata } from "next"
import { StructuredData } from "@/components/seo/structured-data"
import ClientFAQPage from "./client-page"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to everything about ASTRAL AI. From subscriptions and billing to technical security and API integration.",
  alternates: {
    canonical: "/faq",
  },
}

export const revalidate = 3600 // Cache for 1 hour

export default async function FAQPage() {
  const faqs = await (prisma as any).faq.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  })

  // Generate Google Schema markup for FAQPage targeting Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      <StructuredData data={faqSchema} />
      <ClientFAQPage initialFaqs={faqs} />
    </>
  )
}
