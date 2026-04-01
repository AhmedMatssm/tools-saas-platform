"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Zap, 
  ArrowLeft, 
  Rocket, 
  CircleHelp as HelpCircle, 
  Settings, 
  Hammer, 
  Clock 
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function MaintenancePage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6 bg-mesh bg-opacity-10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center space-y-12"
      >
        <div className="space-y-6">
           <div className="w-20 h-20 bg-gradient-premium rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-3xl shadow-blue-500/30 animate-float">
             <Hammer className="text-white w-10 h-10" />
           </div>
           <h1 className="text-4xl md:text-6xl font-black">Major <span className="text-blue-500">Refit</span></h1>
           <p className="text-muted-foreground text-sm uppercase tracking-widest font-black leading-relaxed italic pr-2">
              Neural Upgrade in progress
           </p>
        </div>

        <Card className="p-8 md:p-12 space-y-6 border-white/5 bg-surface shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
           <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-500 font-bold uppercase tracking-widest">
                 <Clock className="w-4 h-4" />
                 ETC: 30 Minutes
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto italic font-medium tracking-wide">
                 We are currently upgrading our GPU nodes and integrating a new version of our core flux models for even faster generation.
              </p>
           </div>
        </Card>

        <div className="flex justify-center pt-8">
           <Link href="https://status.flux-ai.io">
              <Button variant="outline" className="px-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border-white/10 hover:bg-white/5 shadow-xl">
                 Live Status Update
              </Button>
           </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4 flex items-center justify-center gap-2">
           <HelpCircle className="w-3 h-3" />
           Need access? <span className="text-blue-500 font-bold cursor-pointer hover:underline underline-offset-4">Contact Dev Hub</span>
        </p>
      </motion.div>
    </div>
  )
}
