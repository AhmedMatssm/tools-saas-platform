"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Cookie, Info, ArrowRight, ShieldCheck, Clock, FileText, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function CookiesPage() {
  const cookieTypes = [
    { n: "Essential", d: "Required for login, billing, and system security. Cannot be disabled." },
    { n: "Performance", d: "Anonymous usage logs to help us optimize the speed of generation." },
    { n: "Preferences", d: "Saves your theme choice and favorite UI layouts." },
    { n: "Marketing", d: "Optional tracking to help us understand which ads bring in creators." },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
       <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
             <Cookie className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase">Cookies <span className="text-blue-500">Policy</span></h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic">How we track and remember you</p>
       </div>

       <div className="grid md:grid-cols-2 gap-8">
          {cookieTypes.map((c, i) => (
             <motion.div
                key={c.n}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
             >
                <Card className="p-8 h-full space-y-6 border-white/5 bg-surface hover:border-blue-500 transition-all duration-500 group shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex justify-between items-center relative z-10">
                      <h3 className="text-xl font-bold uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors uppercase tracking-[2px]">{c.n}</h3>
                      {c.n === 'Essential' ? (
                        <div className="w-6 h-6 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-[9px] font-black uppercase tracking-tighter">REQ</div>
                      ) : (
                        <div className="w-12 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-end p-0.5 shadow-inner cursor-pointer hover:border-blue-500/30">
                           <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm" />
                        </div>
                      )}
                   </div>
                   <p className="text-xs text-muted-foreground leading-relaxed italic pr-2 font-medium tracking-wide">
                      {c.d}
                   </p>
                </Card>
             </motion.div>
          ))}
       </div>

       <Card variant="glass" className="p-12 text-center space-y-6 border-white/5 relative overflow-hidden group shadow-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-[5s]" />
          <div className="relative space-y-6">
             <h2 className="text-3xl font-black uppercase tracking-widest">Update Preferences</h2>
             <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto italic">
                By clicking "Save Preferences," you consent to the storage of non-essential cookies on your device to enhance your Flux experience.
             </p>
             <button className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-12 h-14 rounded-2xl shadow-2xl hover:bg-blue-500 hover:text-white transition-all transform hover:translate-y-[-2px]">Save Cookies Settings</button>
          </div>
       </Card>
    </div>
  )
}
