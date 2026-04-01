import { MetadataRoute } from "next"
import prisma from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use env var or fallback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://astral.ai"

  // Fetch all published blogs
  const blogs = await (prisma as any).blog.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  })

  // Dynamic URLs
  const blogUrls = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }))

  // Static URLs
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...blogUrls
  ]
}
