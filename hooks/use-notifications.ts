"use client"

import { useEffect, useState } from "react"
import { getPusherClient } from "@/lib/pusher"
import { useSession } from "next-auth/react"

export function useNotifications() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return

    // Fetch initial count
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count")
        const data = await res.json()
        setUnreadCount(data.count)
      } catch (err) {
        console.error("Failed to fetch unread count", err)
      }
    }

    fetchCount()

    // Subscribe to real-time events
    const pusher = getPusherClient()
    if (!pusher) return

    const channelName = `private-user-${session.user.id}`
    const channel = pusher.subscribe(channelName)
    
    channel.bind("notification:new", (notification: any) => {
      setUnreadCount((prev) => prev + 1)
      // Custom event for the list component to refresh
      window.dispatchEvent(new CustomEvent("notification:received", { detail: notification }))
    })

    return () => {
      pusher.unsubscribe(channelName)
    }
  }, [session?.user?.id])


  return { unreadCount, setUnreadCount }
}

export type Notification = {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CREDIT" | "SYSTEM"
  isRead: boolean
  metadata: any
  createdAt: string
}


