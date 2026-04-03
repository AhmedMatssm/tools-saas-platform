"use client"

import React from "react"
import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { 
  Zap, 
  ArrowLeft, 
  RefreshCcw, 
  ShieldAlert, 
  CircleHelp as HelpCircle, 
  Settings 
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6 bg-mesh bg-opacity-10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center space-y-12"
      >
        <div className="space-y-6">
           <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-3xl shadow-red-500/30 animate-float">
             <ShieldAlert className="text-white w-10 h-10" />
           </div>
           <h1 className="text-4xl md:text-6xl font-black">Neural <span className="text-red-500">Glitch</span></h1>
           <p className="text-muted-foreground text-sm uppercase tracking-widest font-black leading-relaxed italic pr-2">
              Error code: 500 (Platform Crash)
           </p>
        </div>

        <Card className="p-8 md:p-12 space-y-6 border-red-500/10 bg-red-500/[0.02] shadow-2xl relative overflow-hidden group border-white/5">
           <div className="absolute top-0 left-0 w-2 h-full bg-red-600 opacity-20 group-hover:opacity-100 transition-opacity" />
           <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto italic font-medium tracking-wide">
              An unexpected neural drift occurred in our core processing engine. 
              Our engineers have been alerted and are currently patching the flow.
           </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
           <Button 
             variant="premium" 
             onClick={() => reset()}
             className="px-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[3px] shadow-2xl bg-red-600 hover:bg-red-500 shadow-red-600/20 gap-3 group/btn"
           >
              <RefreshCcw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-700" />
              Try Recovery
           </Button>
           <Link href="/">
              <Button variant="outline" className="px-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border-white/10 hover:bg-white/5">
                 Go Home
              </Button>
           </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4 flex items-center justify-center gap-2">
           <HelpCircle className="w-3 h-3 text-red-500" />
           Critical Issue? <span className="text-red-500 font-bold cursor-pointer hover:underline underline-offset-4">Emergency Support</span>
        </p>
      </motion.div>
    </div>
  )
}
