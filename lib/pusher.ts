import Pusher from "pusher"
import PusherJS from "pusher-js"

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

/**
 * Client-side Pusher instance singleton.
 * We initialize it lazily to avoid "default is not a constructor" errors on the server.
 */
let clientInstance: PusherJS | null = null

export const getPusherClient = () => {
  if (typeof window === "undefined") return null
  
  if (!clientInstance) {
    clientInstance = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    })
  }
  return clientInstance
}

// For backward compatibility if needed, but getPusherClient is safer
export const pusherClient = typeof window !== "undefined" ? getPusherClient()! : null as any

