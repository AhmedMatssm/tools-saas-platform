import "server-only"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // In Next 15, params is a promise
) {
  try {
    const { id: postId } = await params
    const count = await (prisma as any).postLike.count({ where: { postId } })
    
    // Check if user has liked
    const session = await getServerSession(authOptions)
    let hasLiked = false
    if (session?.user?.id || session?.user?.email) {
      let dbUser = null
      if (session.user.id) {
        dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
      } else if (session.user.email) {
        dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      }
      if (dbUser) {
        const existing = await (prisma as any).postLike.findUnique({
          where: { userId_postId: { userId: dbUser.id, postId } }
        })
        hasLiked = !!existing
      }
    }

    return NextResponse.json({ count, hasLiked })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const existing = await (prisma as any).postLike.findUnique({
      where: { userId_postId: { userId: dbUser.id, postId } }
    })

    if (existing) {
      await (prisma as any).postLike.delete({ where: { id: existing.id } })
      return NextResponse.json({ message: "Unliked", status: "removed" })
    } else {
      await (prisma as any).postLike.create({
        data: { userId: dbUser.id, postId }
      })
      return NextResponse.json({ message: "Liked", status: "added" })
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
