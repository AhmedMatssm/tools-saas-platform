"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Zap,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  History,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import axios from "axios"
import { format } from "date-fns"

export default function CreditHistoryPage() {
  const { data: session } = useSession()
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  useEffect(() => {
    fetchHistory(1)
  }, [])

  const fetchHistory = async (page: number) => {
    setIsLoading(true)
    try {
      const resp = await axios.get(`/api/user/credits/history?page=${page}&limit=12`)
      if (resp.data.success) {
        setHistory(resp.data.history)
        setPagination(resp.data.pagination)
      }
    } catch (err) {
      console.error("CREDIT_HISTORY_PAGE_ERROR:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type: string, amount: number) => {
    if (amount > 0) {
      if (type === "REWARD") return <Sparkles className="w-4 h-4 text-emerald-400" />
      return <Zap className="w-4 h-4 text-blue-400" />
    }
    return <History className="w-4 h-4 text-white/30" />
  }

  if (!session) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Return to Aura
          </Link>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="w-8 h-8" />
            </div>
            Spectral <span className="text-primary">Audit Log</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Universal credit manifestation history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* STATS OVERVIEW (Optional) */}
        {!isLoading && history.length === 0 ? (
          <Card className="p-24 flex flex-col items-center justify-center border-dashed border-2 bg-transparent text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <History className="w-8 h-8 text-white/20" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest">No spectral trace</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-50">Your Aura has not yet fluctuated.</p>
            </div>
            <Link href="/generate">
              <Button variant="premium" className="rounded-xl px-8 h-12 uppercase text-xs font-black tracking-widest">Begin Manifestation</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">Movement</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">Magnitude</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">Origin</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic text-right">Synchronization</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {isLoading ? (
                        [...Array(6)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={4} className="px-8 py-4"><div className="h-12 bg-white/5 rounded-2xl w-full" /></td>
                          </tr>
                        ))
                      ) : (
                        history.map((log, idx) => (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="group hover:bg-white/[0.03] transition-all border-b border-white/[0.02] last:border-0"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${log.amount > 0 ? "text-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.1)]" : "text-white/40"}`}>
                                  {getIcon(log.type, log.amount)}
                                </div>
                                <div>
                                  <p className="text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-primary transition-colors">{log.type}</p>
                                  <p className="text-[10px] text-white/30 font-medium truncate max-w-[200px] mt-0.5">{log.description || "Spectral Flux"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-lg font-black ${log.amount > 0 ? "text-emerald-400" : "text-rose-400/80"}`}>
                                  {log.amount > 0 ? "+" : ""}{log.amount}
                                </span>
                                <Zap className="w-3 h-3 opacity-20" />
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                                {log.type === "USAGE" ? "Vision" : log.type === "REWARD" ? "Resonance" : "System"}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <p className="text-[10px] text-white/50 font-medium">{format(new Date(log.createdAt), "MMM dd, yyyy")}</p>
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5 opacity-50">{format(new Date(log.createdAt), "HH:mm:ss")}</p>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  onClick={() => fetchHistory(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-xl rounded-2xl bg-white/5 border-white/5 hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Phase <span className="text-white/80">{pagination.page}</span> <span className="mx-2 opacity-30">/</span> {pagination.totalPages}
                </span>
                <Button
                  onClick={() => fetchHistory(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || isLoading}
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-xl rounded-2xl bg-white/5 border-white/5 hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
