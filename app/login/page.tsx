"use client"

import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { Mail, Sparkles, Wand2 } from "lucide-react"
import { Github } from "@/components/layout/icons"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError(null)
    try {
      await signIn("email", { email, callbackUrl: "/dashboard" })
    } catch (err: any) {
      setError("Failed to manifest magic link.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        if (res.error.includes("UNVERIFIED_EMAIL") || res.error.includes("unverified")) {
          setError("Your identity is unverified. Please check your spectral mail.")
        } else {
          setError(res.error || "Invalid spectral credentials.")
        }
      } else {
        const { getSession } = await import("next-auth/react")
        const session = await getSession()
        if (session?.user?.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err: any) {
      setError("Connection to Aura Network failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-10 space-y-10 rounded-[3.5rem] border-border/50 bg-card/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
           
           <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 transform rotate-6 scale-110">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tighter">Enter the <br /><span className="text-primary">Aura Network</span></h1>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-80 italic">Sync your creativity.</p>
           </div>

           <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-[10px] uppercase font-black tracking-widest text-center flex flex-col items-center gap-3">
                  <span>{error}</span>
                  {error.includes("unverified") && (
                    <button 
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        try {
                           setIsLoading(true);
                           await fetch("/api/account/send-verification", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ email })
                           });
                           setError("Verification mail dispatched!");
                        } catch(e) {} finally { setIsLoading(false); }
                      }}
                      className="underline text-primary hover:text-primary/80 transition-colors uppercase py-1"
                    >
                      Resend Verification Mail
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                 <input 
                   disabled={isLoading}
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Your spectral mail" 
                   className="w-full bg-background/50 border border-border h-12 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-all font-body" 
                 />
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                   <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                   <Link 
                     href="/reset-password" 
                     className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter opacity-70 hover:opacity-100 transition-opacity"
                   >
                     Forgot?
                   </Link>
                 </div>
                 <input 
                   disabled={isLoading}
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••" 
                   className="w-full bg-background/50 border border-border h-12 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-all font-body" 
                 />
              </div>

              <Button 
                disabled={isLoading}
                type="submit"
                variant="premium" 
                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 uppercase text-[10px] tracking-widest"
              >
                 {isLoading ? "Syncing..." : "Manifest Identity"}
              </Button>
           </form>

           <div className="space-y-6">
              <div className="relative py-2">
                 <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-border/50" />
                 <span className="relative bg-[#020617] px-4 text-[10px] font-black text-muted-foreground mx-auto block w-fit uppercase tracking-widest">quick connect</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <Button 
                   onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                   variant="outline" 
                   className="rounded-xl h-12 gap-2 text-[10px] font-bold border-border/50 hover:bg-secondary active:scale-95 transition-all shadow-xl shadow-black/5"
                 >
                    <Github className="w-4 h-4" />
                    GitHub
                 </Button>
                 <Button 
                   onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                   variant="outline" 
                   className="rounded-xl h-12 gap-2 text-[10px] font-bold border-border/50 hover:bg-secondary active:scale-95 transition-all shadow-xl shadow-black/5"
                 >
                    <Wand2 className="w-4 h-4 text-primary" />
                    Google
                 </Button>
              </div>
           </div>

           <p className="text-center text-[10px] text-muted-foreground leading-relaxed pt-4">
              New to the swarm? <Link href="/register" className="text-primary font-bold hover:underline">Manifest Account</Link>
           </p>
        </Card>
      </motion.div>
    </div>
  )
}
