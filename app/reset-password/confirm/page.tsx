"use client"

import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff 
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return setError("Missing recovery link.")
    if (password !== confirmPassword) return setError("Passwords do not match.")
    if (password.length < 8) return setError("Password must be at least 8 characters.")

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/account/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update your credentials.")
      }
    } catch (err) {
       setError("Connection to Aura Network lost.")
    } finally {
       setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6">
        <Card className="p-10 max-w-sm w-full text-center space-y-6 border-destructive/20 bg-destructive/5 glass">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Invalid Request</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest leading-relaxed italic pr-2 font-black">THIS RECOVERY LINK IS CORRUPTED OR MISSING ITS METADATA.</p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
               <ArrowLeft className="w-4 h-4" />
               Back to Manifestation
            </Button>
          </Link>
        </Card>
      </div>
    )
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
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                   <div className="w-12 h-12 bg-gradient-premium rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 glass group-hover:rotate-12 transition-transform">
                     <ShieldCheck className="text-white w-7 h-7" />
                   </div>
                   <h1 className="text-3xl font-black">Final <span className="text-blue-500">Upgrade</span></h1>
                   <p className="text-muted-foreground text-sm uppercase tracking-widest font-black leading-relaxed italic pr-2">Define your new credentials for access.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                       <div className="relative group/input">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" />
                          <input 
                             disabled={isLoading}
                             type={showPassword ? "text" : "password"} 
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             placeholder="••••••••" 
                             className="w-full bg-background border border-border p-4 pl-12 rounded-xl outline-none focus:border-blue-500/50 text-sm transition-all shadow-inner disabled:opacity-50"
                             required
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                          >
                             {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Identity</label>
                       <div className="relative group/input">
                          <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" />
                          <input 
                             disabled={isLoading}
                             type={showPassword ? "text" : "password"} 
                             value={confirmPassword}
                             onChange={(e) => setConfirmPassword(e.target.value)}
                             placeholder="••••••••" 
                             className="w-full bg-background border border-border p-4 pl-12 rounded-xl outline-none focus:border-blue-500/50 text-sm transition-all shadow-inner disabled:opacity-50"
                             required
                          />
                       </div>
                    </div>

                    {error && (
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center animate-pulse">
                         {error}
                      </p>
                    )}
                  </div>

                  <Button 
                    disabled={isLoading}
                    type="submit"
                    variant="premium" 
                    className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl gap-2 group/btn"
                  >
                     {isLoading ? "Saving Credentials..." : "Update Password"}
                     <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/10 mb-6">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black">Identity <span className="text-green-500">Restored</span></h1>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-black leading-relaxed italic pr-2">Your credentials have been updated. You can now re-enter the Aura Network.</p>
                </div>
                
                <Link href="/login">
                  <Button variant="premium" className="w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                     Back to Login
                     <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
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
