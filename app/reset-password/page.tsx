"use client"

import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { 
  Sparkles, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  KeyRound 
} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/account/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStep(2)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to dispatch link.")
      }
    } catch (err) {
       setError("Connection to Aura Network failed.")
    } finally {
       setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6 bg-mesh bg-opacity-10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="p-10 space-y-10 border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="text-center space-y-3">
             <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 glass group-hover:scale-110 transition-transform">
               <KeyRound className="text-white w-7 h-7" />
             </div>
             <h1 className="text-3xl font-black">{step === 1 ? "Reset " : "Check "} <span className="text-blue-500">{step === 1 ? "Access" : "Inbox"}</span></h1>
             <p className="text-muted-foreground text-sm uppercase tracking-widest font-black leading-relaxed italic pr-2">
                {step === 1 ? "Enter your email to receive recovery instructions." : "We've sent a secure reset link to your email."}
             </p>
          </div>

          <AnimatePresence mode="wait">
             {step === 1 ? (
               <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
               >
                  <form onSubmit={handleResetRequest} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                       <div className="relative group/input">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" />
                          <input 
                             disabled={isLoading}
                             type="email" 
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             placeholder="name@company.com" 
                             className="w-full bg-background border border-border p-4 pl-12 rounded-xl outline-none focus:border-blue-500/50 text-sm transition-all shadow-inner disabled:opacity-50"
                             required
                          />
                       </div>
                       {error && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center mt-2">{error}</p>}
                    </div>

                    <Button 
                      disabled={isLoading}
                      type="submit"
                      variant="premium" 
                      className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl gap-2 group/btn"
                    >
                       {isLoading ? "Dispatching..." : "Send Reset Link"}
                       <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </form>
               </motion.div>
             ) : (

               <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
               >
                  <Card className="p-8 border-dashed border-blue-500/20 bg-blue-500/5 flex flex-col items-center justify-center text-center space-y-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-xl">
                        <ShieldCheck className="w-6 h-6 text-white" />
                     </div>
                     <p className="text-sm text-white font-bold tracking-tight">Email dispatched securely.</p>
                     <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed italic">The link will expire in 1 hour for your security.</p>
                  </Card>

                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-widest gap-3 hover:bg-white/5 active:scale-95"
                  >
                     Resend Email
                  </Button>
               </motion.div>
             )}
          </AnimatePresence>

          <Link href="/login" className="flex items-center justify-center gap-2 group/back text-muted-foreground hover:text-white transition-colors pt-4 border-t border-border/50">
             <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
          </Link>
        </Card>
      </motion.div>
    </div>
  )
}
