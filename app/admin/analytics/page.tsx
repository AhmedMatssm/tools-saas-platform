"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Globe, 
  MousePointer2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Filter, 
  Calendar 
} from "lucide-react"
import { motion } from "framer-motion"

const topTools = [
  { name: "FluxImage Gen", usage: "48.2k", growth: "+12.5%", color: "bg-blue-600" },
  { name: "Neural Edit", usage: "12.4k", growth: "+8.2%", color: "bg-purple-600" },
  { name: "Magic Upscale", usage: "8.1k", growth: "-2.4%", color: "bg-red-600" },
]

export default function AnalyticsAdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
       {/* 1. HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
             <h1 className="text-4xl font-black flex items-center gap-3">
               <TrendingUp className="w-8 h-8 text-blue-500" />
               Insight <span className="text-blue-500">Analytics</span>
             </h1>
             <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic">Platform-wide performance and growth metrics</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="h-11 rounded-xl px-6 gap-2 text-xs font-black uppercase tracking-widest border-white/5 bg-surface hover:bg-surface-hover">
                <Calendar className="w-4 h-4" />
                Last 30 Days
             </Button>
             <Button variant="premium" className="h-11 rounded-xl px-6 shadow-xl text-xs font-black uppercase tracking-widest">Generate Report</Button>
          </div>
       </div>

       {/* 2. CORE STATS */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { l: "Total Traffic", v: "1.2M", c: "+14.2%", t: "up", i: Globe },
            { l: "User Sessions", v: "482k", c: "+22.8%", t: "up", i: MousePointer2 },
            { l: "Model Calls", v: "1.4M", c: "+8.5%", t: "up", i: Zap },
            { l: "Churn Rate", v: "2.8%", c: "-1.2%", t: "down", i: Activity },
          ].map((s, idx) => (
             <Card key={s.l} className="p-8 space-y-6 flex flex-col group hover:border-blue-500 transition-colors shadow-2xl overflow-hidden relative border-white/5 bg-surface">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-center relative z-10">
                   <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <s.i className="w-5 h-5 text-blue-500 group-hover:text-white" />
                   </div>
                   <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${s.t === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {s.c}
                      {s.t === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                   </div>
                </div>
                <div className="space-y-1 relative z-10">
                   <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{s.l}</p>
                   <h3 className="text-3xl font-black text-white">{s.v}</h3>
                </div>
             </Card>
          ))}
       </div>

       {/* 3. CHART GRID */}
       <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-10 space-y-12 border-white/5 bg-surface shadow-3xl rounded-3xl overflow-hidden group">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <h4 className="text-xl font-bold">Growth Velocity</h4>
                   <p className="text-xs text-muted-foreground uppercase font-black tracking-[2px]">Daily Active Users</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      Organic
                   </div>
                </div>
             </div>
             {/* Chart Visualization Placeholder (Repeated from dashboard with polish) */}
             <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-border/50 pb-2">
                {[20, 50, 60, 45, 80, 70, 95, 100, 85, 75, 90, 60, 55, 100].map((h, i) => (
                  <div key={i} className="flex-1 group/bar relative">
                     <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className={`w-full rounded-t-lg ${i === 7 ? 'bg-blue-600 shadow-xl shadow-blue-500/20' : 'bg-surface-hover group-hover/bar:bg-blue-500/40 transition-colors'} relative z-10`}
                     />
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                        {h}k
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-10 space-y-10 border-white/5 bg-surface shadow-3xl rounded-3xl">
             <h4 className="text-xl font-bold">Device Distribution</h4>
             <div className="space-y-8">
                {[
                  { l: "Desktop (Mac/Win)", v: "78%", i: Monitor, c: "bg-blue-600 shadow-blue-600/30", w: "w-[78%]" },
                  { l: "Mobile (iOS/Android)", v: "14%", i: Smartphone, c: "bg-purple-600 shadow-purple-600/30", w: "w-[14%]" },
                  { l: "Tablet (iPad/ChromeOS)", v: "8%", i: Tablet, c: "bg-gray-600 shadow-gray-600/30", w: "w-[8%]" },
                ].map(dev => (
                   <div key={dev.l} className="space-y-3 group">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <dev.i className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">{dev.l}</p>
                         </div>
                         <span className="text-xs font-black text-blue-500 uppercase tracking-tighter">{dev.v}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden border border-white/5">
                         <div className={`h-full ${dev.c} rounded-full transition-all duration-1000 ${dev.w} shadow-lg`} />
                      </div>
                   </div>
                ))}
             </div>
          </Card>
       </div>

       {/* 4. TOP PERFORMING MODELS */}
       <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-10 space-y-8 border-white/5 bg-surface shadow-3xl rounded-3xl">
             <h4 className="text-xl font-bold flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                Top Performing Models
             </h4>
             <div className="space-y-6">
                {topTools.map(tool => (
                   <div key={tool.name} className="flex items-center justify-between p-6 rounded-2xl bg-surface-hover/30 border border-white/5 group hover:border-blue-500/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${tool.color} shadow-lg shadow-current`} />
                         <div className="space-y-0.5">
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{tool.name}</p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Monthly Generates</p>
                         </div>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-lg font-black text-white">{tool.usage}</p>
                         <p className={`text-[10px] font-black flex items-center gap-1 justify-end ${tool.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {tool.growth}
                            {tool.growth.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </Card>

          {/* Quick Metrics Board */}
          <Card variant="glass" className="p-12 md:p-16 flex flex-col items-center justify-center text-center space-y-8 border-white/5 relative group shadow-3xl overflow-hidden">
             <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-[8s]" />
             <div className="relative space-y-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-12 transition-transform">
                   <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black">Average Latency: <span className="text-blue-500">1.18s</span></h3>
                <p className="text-muted-foreground text-xs uppercase font-black tracking-widest leading-relaxed max-w-xs mx-auto italic">Platform response speed has improved by 412ms since our v2.0 update.</p>
                <div className="pt-4 flex gap-4 justify-center">
                   <Button variant="secondary" className="px-8 text-[9px] font-black uppercase tracking-widest rounded-xl">Network Specs</Button>
                   <Button variant="outline" className="px-8 text-[9px] font-black uppercase tracking-widest rounded-xl border-white/5 hover:bg-white/5">Update Hub</Button>
                </div>
             </div>
          </Card>
       </div>
    </div>
  )
}

import { Activity } from "lucide-react"
