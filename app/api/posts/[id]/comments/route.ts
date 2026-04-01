import "server-only"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    
    // Fetch top-level comments and include replies (up to 1 level deep for simplicity)
    const comments = await (prisma as any).comment.findMany({
      where: { postId, status: "APPROVED", parentId: null },
      include: {
        user: { select: { id: true, name: true, role: true } },
        replies: {
          where: { status: "APPROVED" },
          include: {
            user: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(comments)
  } catch (err) {
    console.error("[GET_COMMENTS_ERROR]", err)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
