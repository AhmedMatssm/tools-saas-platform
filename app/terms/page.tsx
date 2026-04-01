"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Scale, Info, ArrowRight, ShieldCheck, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"

export default function TermsPage() {
  const sections = [
    { title: "Acceptance", content: "By accessing AI Flux, you agree to be bound by these unified Terms of Service and all applicable neural usage guidelines." },
    { title: "Asset Ownership", content: "You own all generated outputs created using your Pro or Enterprise account. Free seeds remain public domain under CC-BY-NC license." },
    { title: "Forbidden Use", content: "Do not generate CSAM, violent content, or deepfakes of real public figures. System monitoring is active and violations lead to immediate banning." },
    { title: "Refunds & Billing", content: "Subscription changes occur at the end of the billing cycle. Refunds are processed within 7 business days for unused credits only." },
    { title: "Platform Liability", content: "AI Flux provides an interface to generative models. We are not liable for the creative decisions made by the neural engine." },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
       <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
             <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase">Terms of <span className="text-blue-500">Service</span></h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic">Operating License v4.2 stable</p>
       </div>

       <Card className="p-10 md:p-16 space-y-12 border-white/5 bg-surface shadow-3xl rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-12 relative z-10">
             {sections.map((sec, i) => (
                <div key={i} className="space-y-4 group/section">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-[10px] font-black text-blue-500 group-hover/section:bg-blue-600 group-hover/section:text-white transition-all">
                         0{i + 1}
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-widest text-white group-hover/section:text-blue-400 transition-colors uppercase tracking-[2px]">{sec.title}</h2>
                   </div>
                   <p className="text-muted-foreground leading-relaxed pl-12 italic border-l border-border/50 group-hover/section:border-blue-500/50 transition-colors">
                      {sec.content}
                   </p>
                </div>
             ))}
          </div>
       </Card>
    </div>
  )
}
