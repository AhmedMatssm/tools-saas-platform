"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash, Filter, Settings, Search, MoreVertical, RefreshCw, X, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { Button } from "@/components/common/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  metadata: any
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
  }, [filter, page])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/notifications?filter=${filter}&page=${page}&limit=20`)
      const data = await res.json()
      setNotifications(data.notifications || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      console.error("Failed to fetch", err)
    } finally {
      setIsLoading(false)
    }
  }

  const markRead = async (id: string) => {
    // Optimistic UI
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
  }

  const deleteNotif = async (id: string) => {
    // Optimistic UI
    setNotifications(prev => prev.filter(n => n.id !== id))
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await fetch("/api/notifications/mark-all-read", { method: "POST" })
  }

  const getTypeStyles = (type: string) => {
    switch(type) {
       case "SUCCESS": return "bg-green-500/10 text-green-400 border-green-500/20"
       case "ERROR": return "bg-red-500/10 text-red-400 border-red-500/20"
       case "WARNING": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
       case "CREDIT": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
       default: return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
 }

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent uppercase tracking-tighter">
              Notifications
            </h1>
            <p className="text-gray-400 text-sm">Stay updated with your spectral activities.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllRead}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-widest"
             >
                Mark all as read
             </Button>
             <Link href="/dashboard/notifications/settings">
                <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10">
                   <Settings className="w-4 h-4" />
                </Button>
             </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
           <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
           </div>
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {(["all", "unread", "read"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilter(t); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === t 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        {/* List */}
        <div className="space-y-4">
           {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                 <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manifesting updates...</p>
              </div>
           ) : filteredNotifications.length > 0 ? (
              <div className="grid gap-4">
                 <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group relative p-6 rounded-2xl border transition-all ${
                          !n.isRead 
                            ? "bg-indigo-500/5 border-indigo-500/20 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]" 
                            : "bg-white/5 border-white/10 grayscale-[0.5] hover:grayscale-0"
                        }`}
                      >
                         <div className="flex gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeStyles(n.type)} border`}>
                               <Bell className="w-6 h-6" />
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${getTypeStyles(n.type)}`}>
                                     {n.type}
                                  </span>
                                  <span className="text-xs text-gray-500 font-medium tracking-tight">
                                     {format(new Date(n.createdAt), "MMM d, yyyy • h:mm a")}
                                  </span>
                                </div>
                                <div>
                                   <h3 className={`text-lg font-bold ${!n.isRead ? 'text-white' : 'text-gray-300'}`}>{n.title}</h3>
                                   <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{n.message}</p>
                                   {n.metadata?.link && (
                                      <Link 
                                         href={n.metadata.link}
                                         className="inline-flex items-center gap-2 mt-4 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                                      >
                                         Launch Action <ExternalLink className="w-3 h-3" />
                                      </Link>
                                   )}
                                </div>
                            </div>
                         </div>

                         {/* Actions */}
                         <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            {!n.isRead && (
                               <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => markRead(n.id)}
                                  className="w-8 h-8 rounded-lg bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20 hover:border-green-500/30 transition-all"
                               >
                                  <Check className="w-4 h-4" />
                               </Button>
                            )}
                            <Button 
                               variant="outline" 
                               size="icon" 
                               onClick={() => deleteNotif(n.id)}
                               className="w-8 h-8 rounded-lg bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                            >
                               <Trash className="w-4 h-4" />
                            </Button>
                         </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-gray-700" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-widest">Spectral Silence</h3>
                 <p className="text-gray-500 mt-2">No notifications found in your dimension.</p>
              </div>
           )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
           <div className="flex items-center justify-center gap-2 pt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                 <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                       page === i + 1 
                         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                         : "bg-white/5 text-gray-500 hover:bg-white/10"
                    }`}
                 >
                    {i + 1}
                 </button>
              ))}
           </div>
        )}
      </div>
    </div>
  )
}
