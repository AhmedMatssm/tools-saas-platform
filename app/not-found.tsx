"use client"

import React from "react"
import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { 
  Sparkles, 
  ArrowLeft, 
  Rocket, 
  CircleHelp as HelpCircle, 
  MessageCircle, 
  Zap, 
  AlertCircle 
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6 bg-mesh bg-opacity-10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[200px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg text-center space-y-12"
      >
        <div className="space-y-6">
           {/* BIG 404 Visualizer */}
           <div className="relative inline-block group">
              <h1 className="text-[12rem] md:text-[18rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent leading-none select-none tracking-tighter">404</h1>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-24 h-24 bg-gradient-premium rounded-3xl flex items-center justify-center shadow-3xl shadow-blue-500/40 rotate-12 group-hover:rotate-0 transition-transform duration-500 animate-float">
                    <AlertCircle className="text-white w-12 h-12" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black">Lost in the <span className="text-blue-500 underline decoration-blue-500/20">Latent Space?</span></h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed italic pr-2">
                 The neural path you are searching for does not seem to exist in our current model. 
                 Try navigating back to the Flux home base.
              </p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
           <Link href="/">
              <Button variant="premium" className="px-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-2xl gap-3">
                 <ArrowLeft className="w-4 h-4" />
                 Go Home
              </Button>
           </Link>
           <Link href="/faq">
              <Button variant="outline" className="px-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border-white/10 hover:bg-white/5">
                 Get Help
              </Button>
           </Link>
        </div>

        {/* Quick Footer Options */}
        <div className="flex items-center justify-center gap-8 pt-12 border-t border-border/30 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">New Models</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Fast Speed</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Pricing</span>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
