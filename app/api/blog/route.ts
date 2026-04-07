import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const category = searchParams.get("category") || ""
    const tag = searchParams.get("tag") || ""
    const search = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "9")
    const skip = (page - 1) * limit

    // Single post by slug
    if (slug) {
      const post = await (prisma as any).blog.findUnique({ where: { slug, published: true } })
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({ success: true, post })
    }

    // List posts
    const where = {
      published: true,
      ...(category && { category }),
      ...(tag && { tags: { has: tag } }),
      ...(search && { OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]}),
    }

    const [total, posts] = await Promise.all([
      (prisma as any).blog.count({ where }),
      (prisma as any).blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, slug: true, excerpt: true, image: true,
          category: true, tags: true, readTime: true,
          published: true, createdAt: true,
        }
      })
    ])

    // All categories for filter
    const categories = await (prisma as any).blog.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    })

    return NextResponse.json({
      success: true,
      blogs: posts,
      total,
      pages: Math.ceil(total / limit),
      page,
      categories: categories.map((c: any) => c.category),
    })
  } catch (error) {
    console.error("BLOG_ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
