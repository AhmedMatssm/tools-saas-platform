import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email

    const dbUser = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail! }
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const savedPosts = await (prisma as any).savedPost.findMany({
      where: { userId: dbUser.id },
      include: {
        post: {
          select: {
            title: true,
            slug: true,
            image: true,
            category: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, savedPosts })
  } catch (err: any) {
    console.error("[SAVED_POSTS_GET_ERROR]", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
