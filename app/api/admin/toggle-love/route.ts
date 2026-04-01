import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { generationId, isLoved } = await req.json()
    console.log(`[TOGGLE_LOVE] GenID: ${generationId}, TargetLove: ${isLoved}`)

    if (!generationId) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    // Using raw SQL as a fallback because the Prisma client might be out of sync
    // Using Prisma update to prevent SQL injection
    try {
      const updated = await prisma.generation.update({
        where: { id: generationId },
        data: { isLoved: Boolean(isLoved) }
      })

      return NextResponse.json({ success: true, isLoved: updated.isLoved })
    } catch (sqlErr: any) {
      console.error("SQL_FALLBACK_ERR:", sqlErr.message)
      // If it fails with "column does not exist", then we know we need db push.
      throw sqlErr
    }
  } catch (error: any) {
    console.error("TOGGLE_LOVE_ERR:", error.message || error)
    const extra = error.message?.includes('column "isLoved" does not exist')
      ? "\nNote: Database schema is out of sync. Please restart server and run: npx prisma db push"
      : ""
    return NextResponse.json({
      error: "Failed to heart vision: " + (error.message || "Internal error") + extra
    }, { status: 500 })
  }
}
