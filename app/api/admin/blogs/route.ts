import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"
import { getServerAuthSession } from "@/lib/auth"
import { z } from "zod"

const blogSchema = z.object({
  title:     z.string().min(1).max(200),
  slug:      z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only"),
  content:   z.string().min(1),
  excerpt:   z.string().max(500).optional().default(""),
  image:     z.string().optional().nullable(),
  ogImage:   z.string().optional().nullable(),
  tags:      z.array(z.string()).optional().default([]),
  category:  z.string().optional().default("General"),
  readTime:  z.number().int().min(0).optional().default(0),
  published:    z.boolean().optional().default(false),
  scheduledAt:  z.string().optional().nullable(),
  metaTitle:    z.string().max(160).optional().default(""),
  metaDesc:     z.string().max(320).optional().default(""),
  keywords:     z.array(z.string()).optional().default([]),
  canonical:    z.string().optional().nullable(),
})

const patchSchema = blogSchema.partial().extend({ id: z.string() })

// ── ADMIN: GET all posts incl. drafts ────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // "published" | "draft" | null (all)
    const search = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""

    const posts = await (prisma as any).blog.findMany({
      where: {
        ...(status === "published" && { published: true }),
        ...(status === "draft" && { published: false }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true, image: true,
        category: true, tags: true, readTime: true, views: true,
        published: true, scheduledAt: true, createdAt: true, updatedAt: true,
        metaTitle: true, metaDesc: true,
        _count: {
          select: {
            comments: true,
            likes: true,
            savedPosts: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, blogs: posts })
  } catch (error) {
    console.error("ADMIN_BLOG_GET:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

// ── CREATE ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const data = blogSchema.parse(body)

    // Auto-calculate read time if not provided (200 wpm average)
    if (!data.readTime) {
      const wordCount = data.content.trim().split(/\s+/).length
      data.readTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    const post = await (prisma as any).blog.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      }
    })

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("ADMIN_BLOG_POST:", error)
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 })
  }
}

// ── UPDATE ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...rest } = patchSchema.parse(body)

    // Recalculate read time on content change
    if (rest.content) {
      const wordCount = rest.content.trim().split(/\s+/).length
      rest.readTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    const post = await (prisma as any).blog.update({
      where: { id },
      data: {
        ...rest,
        scheduledAt: rest.scheduledAt ? new Date(rest.scheduledAt) : null,
      }
    })

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error("ADMIN_BLOG_PATCH:", error)
    return NextResponse.json({ error: error.message || "Failed to update post" }, { status: 500 })
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await (prisma as any).blog.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ADMIN_BLOG_DELETE:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
