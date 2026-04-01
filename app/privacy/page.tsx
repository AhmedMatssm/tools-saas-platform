"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Info, ArrowRight, TableOfContents, Clock, FileText } from "lucide-react"
import { motion } from "framer-motion"

export default function PrivacyPage() {
  const sections = [
    { title: "Introduction", content: "At AI Flux, we take your privacy seriously. This document outlines how we collect, use, and store your data when you use our services." },
    { title: "Data Collection", content: "We collect minimal information required for functional operation: email address, payment details (via Stripe), and generation history." },
    { title: "How We Use Data", content: "Your data is used solely to provide your personalized experience and improve our models. We never sell your personal information to third parties." },
    { title: "AI Model Training", content: "Critically: We do NOT use private user generations to train our public neural models on standard Pro or Enterprise plans." },
    { title: "Security Measures", content: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 standards. Regular security audits are conducted bi-annually." },
    { title: "Your Rights", content: "You have the right to export or delete your account at any time. To do so, visit your account settings or contact privacy@flux.io." },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
       {/* Header */}
       <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
             <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black">Privacy <span className="text-blue-500">Policy</span></h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic">Last Updated: March 24, 2024</p>
       </div>

       {/* Detailed Text Content */}
       <Card className="p-10 md:p-16 space-y-12 border-white/5 bg-surface shadow-3xl rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
          
          <div className="space-y-12 relative z-10">
             {sections.map((sec, i) => (
                <div key={i} className="space-y-4 group/section">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border flex items-center justify-center text-[10px] font-black text-blue-500 group-hover/section:bg-blue-600 group-hover/section:text-white transition-all">
                         0{i + 1}
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-widest text-white group-hover/section:text-blue-400 transition-colors">{sec.title}</h2>
                   </div>
                   <p className="text-muted-foreground leading-relaxed pl-12 italic border-l border-border/50 transition-all group-hover/section:border-blue-500/50">
                      {sec.content}
                   </p>
                </div>
             ))}
          </div>

          <div className="pt-12 border-t border-border/30 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
             <p className="flex items-center gap-2">
                <Info className="w-3 h-3" />
                Next Review: Sept 2024
             </p>
             <p className="flex items-center gap-2 text-blue-500 cursor-pointer hover:underline underline-offset-4">
                Download PDF
                <ArrowRight className="w-3 h-3" />
             </p>
          </div>
       </Card>

       {/* Contact Callout */}
       <Card variant="glass" className="p-12 text-center space-y-6 border-white/5">
          <h3 className="text-2xl font-black">Have Privacy Questions?</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto italic">
             Our dedicated privacy team is ready to provide clarifications on how your asset ownership and neural fingerprinting works.
          </p>
          <button className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-12 h-12 rounded-xl shadow-xl hover:bg-blue-500 hover:text-white transition-all">
             Contact Privacy Team
          </button>
       </Card>
    </div>
  )
}
