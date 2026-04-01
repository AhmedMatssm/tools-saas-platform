import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    
    // Check if user has saved this post
    const session = await getServerSession(authOptions)
    let hasSaved = false
    
    if (session?.user?.id || session?.user?.email) {
      let dbUser = null
      if (session.user.id) {
        dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
      } else if (session.user.email) {
        dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
      }
      
      if (dbUser) {
        // use (prisma as any) until db is fully pushed
        const existing = await (prisma as any).savedPost.findUnique({
          where: { userId_postId: { userId: dbUser.id, postId } }
        })
        hasSaved = !!existing
      }
    }
    
    return NextResponse.json({ hasSaved })
  } catch (err) {
    console.error("[GET_SAVE_ERROR]", err)
    return NextResponse.json({ error: "Failed to fetch save status" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: postId } = await params
    
    let dbUser = null
    if (session.user.id) {
      dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    } else {
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    }
    
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const existing = await (prisma as any).savedPost.findUnique({
      where: { userId_postId: { userId: dbUser.id, postId } }
    })

    if (existing) {
      await (prisma as any).savedPost.delete({ where: { id: existing.id } })
      return NextResponse.json({ message: "Unsaved", status: "removed" })
    } else {
      await (prisma as any).savedPost.create({
        data: { userId: dbUser.id, postId }
      })
      return NextResponse.json({ message: "Saved", status: "added" })
    }
  } catch (err) {
    console.error("[POST_SAVE_ERROR]", err)
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 })
  }
}
