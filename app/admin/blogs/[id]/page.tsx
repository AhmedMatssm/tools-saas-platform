import BlogEditor from "@/components/blog/blog-editor"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await (prisma as any).blog.findUnique({
    where: { id },
  })

  if (!post) {
    notFound()
  }

  // Ensure all fields match the client form schema exactly
  const initialData = {
    title: post.title || "",
    slug: post.slug || "",
    content: post.content || "",
    excerpt: post.excerpt || "",
    image: post.image || "",
    ogImage: post.ogImage || "",
    tags: post.tags || [],
    category: post.category || "General",
    published: post.published || false,
    scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
    metaTitle: post.metaTitle || "",
    metaDesc: post.metaDesc || "",
    keywords: post.keywords || [],
    canonical: post.canonical || "",
  }

  return <BlogEditor initialData={initialData} postId={post.id} />
}
