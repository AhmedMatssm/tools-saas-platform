import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 })
    }

    const { postId, content, parentId } = await req.json()
    if (!postId || !content?.trim()) {
      return NextResponse.json({ success: false, error: "Post ID and content are required" }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! }
    })
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User profile not found in database" }, { status: 404 })
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } })
      if (!parentComment) {
        return NextResponse.json({ success: false, error: "Parent comment no longer exists" }, { status: 404 })
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        userId: dbUser.id,
        content: content.trim(),
        parentId: parentId || null,
        status: dbUser.role === "ADMIN" ? "APPROVED" : "PENDING"
      }
    })

    return NextResponse.json({ success: true, message: "Comment successfully submitted", comment: newComment }, { status: 201 })
  } catch (err: any) {
    console.error("[COMMENTS_POST_ERROR]", err)
    return NextResponse.json({ 
      success: false, 
      error: err?.message || "Internal server error occurred while processing your comment" 
    }, { status: 500 })
  }
}
