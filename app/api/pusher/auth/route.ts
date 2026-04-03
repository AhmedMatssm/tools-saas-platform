import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"
import { getServerAuthSession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.formData()
    const socketId = body.get("socket_id") as string
    const channel = body.get("channel_name") as string

    // Security check: only allow users to subscribe to their own private channel
    if (channel !== `private-user-${session.user.id}`) {
      return new Response("Forbidden", { status: 403 })
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channel)
    return NextResponse.json(authResponse)
  } catch (error) {
    console.error("[PUSHER_AUTH_ERROR]:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
