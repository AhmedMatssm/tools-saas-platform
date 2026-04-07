"use client"

import { Card } from "@/components/common/card"
import { Button } from "@/components/common/button"
import { motion } from "framer-motion"
import { Shield, FileText, Users, ArrowUpRight } from "lucide-react"

export default function AdminDashboard() {
  const recent: any[] = []
  const isLoading = false

  if (isLoading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.5em] text-primary">Engaging Admin Aura...</div>

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
        </div>
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
