"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { Sparkles, ArrowRight, User, Mail, Lock } from "lucide-react"
import { Github } from "@/components/layout/icons"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import axios from "axios"
import Cookies from "js-cookie"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [referrerId, setReferrerId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ── REFERRAL TRACKING ──────────────────────────────────
  // Store referral in a cookie so it persists social sign-ins
  useEffect(() => {
    const urlRef = searchParams.get("ref")
    if (urlRef) {
       Cookies.set("astral_ref_id", urlRef, { expires: 1 }) // 1 day
       setReferrerId(urlRef)
    } else {
       const cookieRef = Cookies.get("astral_ref_id")
       if (cookieRef) setReferrerId(cookieRef)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const resp = await axios.post("/api/account/register", { ...formData, referrerId })
      if (resp.data.success) {
        router.push("/login?message=manifestation_complete")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Manifestation failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6 bg-mesh bg-opacity-10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Card className="p-10 space-y-10 border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-premium opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="text-center space-y-3">
             <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
               <Sparkles className="text-white w-7 h-7" />
             </div>
             <h1 className="text-3xl font-black">Get <span className="text-blue-500">Started</span></h1>
             <p className="text-muted-foreground text-sm text-[10px] uppercase tracking-widest font-black">Join 10k+ Creators</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
             {error && (
               <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-[10px] uppercase font-black tracking-widest text-center animate-in fade-in slide-in-from-top-1">
                 {error}
               </div>
             )}

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                     required
                     disabled={isLoading}
                     type="text" 
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     placeholder="John Doe" 
                     className="w-full bg-background border border-border p-4 pl-12 rounded-xl outline-none focus:border-blue-500/50 text-sm transition-all"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                     required
                     disabled={isLoading}
                     type="email" 
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     placeholder="name@company.com" 
                     className="w-full bg-background border border-border p-4 pl-12 rounded-xl outline-none focus:border-blue-500/50 text-sm transition-all"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                     required
                     disabled={isLoading}
                     type="password" 
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     placeholder="••••••••" 
                     className="w-full bg-background border border-border p-4 pl-12 rounded-xl outline-none focus:border-blue-500/50 text-sm transition-all"
                   />
                </div>
             </div>

             <Button 
               type="submit"
               disabled={isLoading}
               variant="premium" 
               className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl group"
             >
                {isLoading ? "Manifesting..." : "Create Account"}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
             </Button>
          </form>

          <div className="space-y-6">
             <div className="relative py-4">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-border" />
                <span className="relative bg-[#020617] px-4 text-[10px] font-bold text-muted-foreground mx-auto block w-fit uppercase">quick join with</span>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} variant="outline" className="rounded-xl h-12 text-xs font-bold gap-2 hover:bg-white/5">
                   <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-4 h-4 grayscale" />
                   Google
                </Button>
                <Button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} variant="outline" className="rounded-xl h-12 text-xs font-bold gap-2 hover:bg-white/5">
                   <Github className="w-4 h-4" />
                   GitHub
                </Button>
             </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
             Already part of our network?{" "}
             <Link href="/login" className="text-blue-500 font-bold hover:text-blue-400">Log In</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
