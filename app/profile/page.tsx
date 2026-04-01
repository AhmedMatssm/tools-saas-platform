"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  User, 
  Mail, 
  MapPin, 
  Settings, 
  Star, 
  Zap, 
  Activity, 
  Camera, 
  Globe, 
  ExternalLink, 
  Edit3 
} from "lucide-react"
import { motion } from "framer-motion"

import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session } = useSession()
  
  const stats = [
    { label: "Generations", value: "0", icon: Zap },
    { label: "Storage Used", value: "0%", icon: Activity },
    { label: "Badges", value: "1", icon: Star },
  ]

  const recentHistory = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
    "https://images.unsplash.com/photo-1633167606207-d840b5070fc2",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4",
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
       {/* 1. PROFILE HERO */}
       <section className="relative h-64 md:h-80 rounded-3xl overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-mesh opacity-50 group-hover:scale-110 transition-transform duration-[10s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-[-60px] md:bottom-[-80px] left-12 flex items-end gap-6">
             <div className="relative group/avatar">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-surface border-4 border-background overflow-hidden relative shadow-2xl">
                   <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400" alt="Avatar" className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                   </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xl border-2 border-background">
                   <Edit3 className="w-4 h-4 text-white" />
                </div>
             </div>
             
             <div className="pb-16 md:pb-20 space-y-1">
                <h1 className="text-3xl md:text-5xl font-black text-white">{session?.user?.name || "Aura Creator"}</h1>
                <p className="text-muted-foreground text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   Flux Pro Creator Since 2024
                </p>
             </div>
          </div>
       </section>

       {/* 2. STATS & INFO SPLIT */}
       <div className="grid md:grid-cols-3 gap-12 pt-24">
          <div className="md:col-span-1 space-y-12">
             <div className="space-y-6">
                <h3 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">General Info</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm text-white">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
                         <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      {session?.user?.email || "Ghost Mail"}
                   </div>
                   <div className="flex items-center gap-3 text-sm text-white">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
                         <MapPin className="w-4 h-4 text-blue-500" />
                      </div>
                      San Francisco, CA
                   </div>
                   <div className="flex items-center gap-3 text-sm text-white">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-border">
                         <Globe className="w-4 h-4 text-blue-500" />
                      </div>
                      flux.io/alexrivers
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                   </div>
                </div>
             </div>

             <div className="space-y-6 pt-12 border-t border-border">
                <h3 className="text-lg font-bold uppercase tracking-widest text-muted-foreground">Stats Overview</h3>
                <div className="space-y-4">
                   {stats.map(s => (
                     <Card key={s.label} className="p-6 space-y-4 group hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between items-center">
                           <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
                             <s.icon className="w-5 h-5 text-blue-500 group-hover:text-white" />
                           </div>
                           <h4 className="text-2xl font-black text-white">{s.value}</h4>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-blue-300 transition-colors">{s.label}</p>
                     </Card>
                   ))}
                </div>
             </div>
          </div>

          <div className="md:col-span-2 space-y-12">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                   <Zap className="w-6 h-6 text-blue-500" />
                   Recent Showcases
                </h3>
                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-blue-500 hover:bg-transparent">View All</Button>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                {recentHistory.map((src, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface group"
                  >
                     <img src={src} alt="Showcase" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex justify-between items-center">
                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Generated #0{i+1}</p>
                        <ExternalLink className="w-4 h-4 text-white" />
                     </div>
                  </motion.div>
                ))}
             </div>

             {/* Pro Achievement Badge */}
             <Card variant="glass" className="p-12 md:p-16 text-center space-y-6 border-white/5 relative overflow-hidden group shadow-3xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-[5s]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-[5s]" />
                
                <div className="relative space-y-6">
                   <div className="w-20 h-20 bg-gradient-premium rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-500 group-hover:animate-spin-slow">
                      <Star className="text-white w-10 h-10 fill-white" />
                   </div>
                   <h2 className="text-3xl font-black">Trusted Elite <span className="text-blue-500">Creator</span></h2>
                   <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                     You have surpassed 1,000 generations this month. You have been awarded the Elite badge and 500 bonus credits for April.
                   </p>
                   <Button variant="premium" className="px-12 h-12 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl">Claim Bonus</Button>
                </div>
             </Card>
          </div>
       </div>

       {/* Quick Actions Footer */}
       <div className="pt-12 border-t border-border flex justify-between items-center gap-6 text-sm">
          <p className="text-muted-foreground">Account active for 132 days.</p>
          <div className="flex gap-4">
             <Button variant="outline" className="text-xs font-bold gap-2 rounded-xl">
                <Settings className="w-4 h-4" />
                Manage Settings
             </Button>
             <Button variant="secondary" className="text-xs font-bold gap-2 rounded-xl">
                Deactivate Account
             </Button>
          </div>
       </div>
    </div>
  )
}
