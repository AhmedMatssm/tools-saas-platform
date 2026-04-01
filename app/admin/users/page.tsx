"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Mail, Shield, UserX, UserCheck, Trash2, Search, ArrowRight, Activity, Zap } from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const resp = await axios.get("/api/admin/users")
      if (resp.data.success) {
        setUsers(resp.data.users)
      }
    } catch (error) {
      console.error("ADMIN_USERS:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase underline decoration-primary/20 underline-offset-8">Aura <span className="text-primary italic">Residents</span></h1>
          <p className="text-muted-foreground text-sm font-bold opacity-80 uppercase tracking-widest leading-relaxed italic">Managing the swarm of creative entities.</p>
        </div>

        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search Residents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-card/40 border border-border rounded-2xl pl-12 pr-6 outline-none focus:border-primary/50 transition-all font-body text-sm"
          />
        </div>
      </div>

      <Card className="rounded-[4rem] border-border/50 bg-card/10 backdrop-blur-3xl shadow-2xl overflow-hidden p-3 group">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-border/40">
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Entity</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status/Role</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Manifestations</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Joined</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {filteredUsers.map((u, idx) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className="border-b border-border/20 group/row hover:bg-white/5 transition-all"
                    >
                       <td className="p-8">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black group-hover/row:scale-110 transition-transform">
                               {u.name?.[0] || u.email?.[0] || <Users className="w-5 h-5" />}
                             </div>
                             <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest">{u.name || "Anonymous Resident"}</p>
                                <p className="text-[10px] text-muted-foreground font-medium italic opacity-60 leading-none">{u.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-8">
                          <div className="flex items-center gap-3">
                             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                               u.role === "ADMIN" ? "bg-primary/20 text-primary border-primary/20" : "bg-secondary/20 text-muted-foreground border-border/20"
                             }`}>
                                {u.role}
                             </span>
                             <Activity className="w-4 h-4 text-green-500/50 animate-pulse" />
                          </div>
                       </td>
                       <td className="p-8">
                          <div className="flex items-center gap-2">
                             <Zap className="w-4 h-4 text-primary" />
                             <span className="text-sm font-black tracking-tighter italic">441</span>
                          </div>
                       </td>
                       <td className="p-8">
                          <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest leading-none block">{new Date(u.createdAt).toLocaleDateString()}</span>
                       </td>
                       <td className="p-8">
                          <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary/20 text-primary"><UserCheck className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-500"><UserX className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white text-black"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                       </td>
                    </motion.tr>
                  ))}
               </tbody>
            </table>
            {filteredUsers.length === 0 && !isLoading && <div className="p-40 text-center font-black uppercase tracking-[0.2em] opacity-40 text-primary">Resident Swarm Vacuum.</div>}
         </div>
      </Card>
    </div>
  )
}
