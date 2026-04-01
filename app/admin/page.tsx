"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Users, Zap, FileText, Activity, ArrowUpRight, TrendingUp, Monitor, Shield, MessageCircle, ThumbsUp, Bookmark } from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const resp = await axios.get("/api/admin/stats")
      if (resp.data.success) {
        setStats(resp.data.stats)
        setRecent(resp.data.recentGenerations || [])
      }
    } catch (error) {
      console.error("ADMIN_STATS:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-primary">Engaging Admin Aura...</div>

  const statCards = [
    { label: "Total Visitors", value: stats?.totalVisitors || 0, icon: Monitor, color: "blue", trend: "Live" },
    { label: "Today Hits", value: stats?.todayVisitors || 0, icon: Activity, color: "emerald", trend: "Today" },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "blue", trend: "+12%" },
    { label: "Manifestations", value: stats?.totalGenerations || 0, icon: Zap, color: "purple", trend: "+24%" },
    { label: "Blog Posts", value: stats?.totalBlogs || 0, icon: FileText, color: "indigo", trend: "+0%" },
    { label: "Comments", value: stats?.totalComments || 0, icon: MessageCircle, color: "green", trend: "+45%" },
    { label: "Post Likes", value: stats?.totalLikes || 0, icon: ThumbsUp, color: "teal", trend: "+80%" },
    { label: "Saved Posts", value: stats?.totalSaved || 0, icon: Bookmark, color: "orange", trend: "+15%" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase underline decoration-primary/20 underline-offset-8">Aura Control <span className="text-primary italic">Panel</span></h1>
          <p className="text-muted-foreground text-sm font-body font-bold opacity-80 uppercase tracking-widest">Platform Intelligence & Manifestation Control</p>
        </div>
        <div className="flex gap-4 flex-wrap">
           <a href="/admin/support">
             <Button variant="outline" className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400">Support <Shield className="w-4 h-4" /></Button>
           </a>
           <a href="/admin/blogs">
             <Button variant="outline" className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/10">Manage Blogs <FileText className="w-4 h-4" /></Button>
           </a>
           <a href="/admin/users">
             <Button variant="outline" className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest">Users <Users className="w-4 h-4" /></Button>
           </a>
           <a href="/admin/loves">
             <Button variant="outline" className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest border-red-500/30 text-red-500 hover:bg-red-500/10">Loves <ThumbsUp className="w-4 h-4" /></Button>
           </a>
           <Button onClick={fetchStats} variant="outline" className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest">Refresh <Activity className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
         {statCards.map((s, idx) => (
           <motion.div
             key={s.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: idx * 0.1 }}
           >
             <Card className="p-10 rounded-[3rem] border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/40 transition-all shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <s.icon className="w-24 h-24" />
                </div>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className={`p-4 rounded-2xl bg-primary/10 text-primary`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {s.trend}</span>
                   </div>
                   <div className="space-y-2">
                     <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                     <h3 className="text-4xl font-black tracking-tighter">{s.value}</h3>
                   </div>
                </div>
             </Card>
           </motion.div>
         ))}
      </div>

      <div className="w-full">
         <AnalyticsCharts />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
         <Card className="lg:col-span-12 p-12 rounded-[4rem] border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-widest shrink-0">Recent <span className="text-primary">Visions</span></h3>
              <a href="/admin/generations">
                <Button variant="outline" className="rounded-xl px-6 h-10 gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border-primary/20">View All Generations <ArrowUpRight className="w-3 h-3" /></Button>
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {recent.map((gen, idx) => (
                 <motion.div 
                   key={gen.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.4, delay: idx * 0.1 }}
                   className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                 >
                    <img src={gen.imageUrl} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/10 shadow-lg" alt="Recent gen" />
                    <div className="flex-1 min-w-0 space-y-1.5 pt-1">
                       <p className="text-xs font-black truncate uppercase tracking-widest text-white/90">{gen.prompt}</p>
                       <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black italic opacity-60">ID: {gen.id.slice(-6)} · IP: {gen.ip?.slice(0, 8)}</p>
                    </div>
                 </motion.div>
               ))}
               {recent.length === 0 && <p className="col-span-full text-center py-20 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">No manifestations yet.</p>}
            </div>
         </Card>
      </div>
    </div>
  )
}
