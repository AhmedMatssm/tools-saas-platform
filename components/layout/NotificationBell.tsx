"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Info, CheckCircle2, AlertTriangle, XCircle, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import axios from "axios"
import { pusherClient } from "@/lib/pusher"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CREDIT" | "SYSTEM"
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/api/account/notifications")
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length)
      }
    } catch (err) {
      console.error("Failed to fetch notifications")
    }
  }

  useEffect(() => {
    if (!session?.user) return
    fetchNotifications()

    const channel = pusherClient.subscribe(`private-user-${(session.user as any).id}`)
    channel.bind("notification:new", (newNotif: Notification) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === newNotif.id)) return prev
        return [newNotif, ...prev]
      })
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      pusherClient.unsubscribe(`private-user-${(session.user as any).id}`)
    }
  }, [session])

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/account/notifications/${id}`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark as read")
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/api/account/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => notifications.find(n => n.id === id)?.isRead ? prev : Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to delete notification")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      case "ERROR": return <XCircle className="w-4 h-4 text-red-400" />
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "CREDIT": return <Zap className="w-4 h-4 text-primary" />
      default: return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-white transition-colors group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg shadow-primary/20">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 max-h-[500px] bg-card border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notifications</h3>
                {unreadCount > 0 && (
                   <span className="text-[9px] font-black text-primary uppercase tracking-tighter">
                     {unreadCount} UNREAD SPECTRUMS
                   </span>
                )}
              </div>

              <div className="overflow-y-auto max-h-[400px] p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`group p-4 rounded-2xl transition-all border border-transparent ${n.isRead ? "opacity-60 hover:opacity-100" : "bg-white/[0.03] border-white/5 shadow-sm"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getTypeIcon(n.type)}</div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-tight text-white leading-none">{n.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground/40 font-medium uppercase tracking-tighter">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-400 transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-400/10 text-muted-foreground hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                      <Bell className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                      No spectral activity detected
                    </p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/5 bg-white/[0.01] text-center">
                   <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                     View Dimensional History
                   </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
