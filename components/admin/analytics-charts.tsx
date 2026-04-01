"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import axios from "axios"
import { Loader2, TrendingUp, Users, Activity } from "lucide-react"

export function AnalyticsCharts() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<{ gens: any, users: any, traffic: any }>({ gens: {}, users: null, traffic: null })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [genRes, userRes, trafficRes] = await Promise.all([
          axios.get(`/api/admin/analytics/generations?days=${days}`),
          axios.get(`/api/admin/analytics/users`),
          axios.get(`/api/admin/analytics/traffic?days=${days}`)
        ])
        setData({
          gens: genRes.data,
          users: userRes.data,
          traffic: trafficRes.data
        })
      } catch (e) {
        console.error("Dashboard fetch failed")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [days])

  if (loading || !data.users) return (
    <div className="flex h-64 items-center justify-center border border-white/5 rounded-[2rem] bg-card/40 my-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const { gens, users, traffic } = data
  const itemsPerPage = 10
  const totalPages = Math.ceil((users.topUsers?.length || 0) / itemsPerPage)
  const paginatedUsers = users.topUsers?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || []

  return (
    <div className="space-y-8 my-8">
      {/* Time Filter */}
      <div className="flex justify-end gap-2">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => { setDays(d); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:text-white"}`}>
            {d} Days
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Generations Chart */}
        <div className="lg:col-span-2 p-6 rounded-[2rem] border border-white/5 bg-card/40 backdrop-blur-xl flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Generations Over Time</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black">{gens.summary?.total || 0}</span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${gens.summary?.trend >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {gens.summary?.trend > 0 ? "+" : ""}{gens.summary?.trend}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[250px] -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gens.data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: "#09090b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", fontWeight: "900" }} 
                   itemStyle={{ color: "#3b82f6" }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="p-6 rounded-[2rem] border border-white/5 bg-card/40 backdrop-blur-xl flex flex-col">
          <div className="mb-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Platform Traffic</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black">{traffic.stats?.uniqueVisitors || 0}</span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Unique visitors</span>
            </div>
          </div>
          <div className="flex-1 min-h-[200px] -ml-6">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={traffic.data}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: "rgba(255,255,255,0.05)" }}
                   contentStyle={{ backgroundColor: "#09090b", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", fontWeight: "900" }} 
                />
                <Bar dataKey="visitors" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             <span>Desktop: {traffic.stats?.desktopPercentage}%</span>
             <span>Mobile: {traffic.stats?.mobilePercentage}%</span>
          </div>
        </div>

      </div>

      {/* Top Users Tracking */}
      <div className="p-6 rounded-[2rem] border border-white/5 bg-card/40 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-muted-foreground">
           <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> User Behavior Analytics (Top Activity)</h2>
           <div className="flex items-center gap-4 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Page {currentPage} of {totalPages || 1}</span>
              <div className="flex gap-1.5">
                 <button 
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                 >
                    <TrendingUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                 </button>
                 <button 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage >= totalPages}
                   className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                 >
                    <TrendingUp className="w-3.5 h-3.5 rotate-[90deg]" />
                 </button>
              </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-muted-foreground uppercase tracking-widest">
                <th className="pb-3 font-black">User</th>
                <th className="pb-3 font-black">Plan</th>
                <th className="pb-3 font-black text-right">Generations</th>
                <th className="pb-3 font-black text-right">Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {paginatedUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 flex flex-col"><span className="font-bold">{u.name}</span><span className="text-[10px] text-muted-foreground font-mono">{u.email}</span></td>
                  <td className="py-4"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.plan === "PRO" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-muted-foreground"}`}>{u.plan}</span></td>
                  <td className="py-4 text-right font-mono font-bold text-primary">{u.generations}</td>
                  <td className="py-4 text-right font-mono text-muted-foreground">{u.logins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
