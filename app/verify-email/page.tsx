"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/common/card"
import { Button } from "@/components/common/button"
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react"

function VerifyEmailInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Establishing connection to Aura Network...")

  useEffect(() => {
    if (!token || !email) {
      return
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/account/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus("success")
          setMessage("Spectral connection verified. Welcome to the swarm.")
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to establish connection.")
        }
      } catch {
        setStatus("error")
        setMessage("Interference in signal. Could not verify.")
      }
    }

    verify()
  }, [token, email])

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] -z-10" />
        <Card className="p-10 space-y-10 rounded-[3.5rem] border-border/50 bg-card/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center max-w-md w-full">
            <div className="w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tighter">Verification Failed</h1>
            <p className="text-muted-foreground text-sm">Missing or corrupted transmission data.</p>
            <Button onClick={() => router.push("/login")} variant="outline" className="w-full h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-border/50">
              Return to Node
            </Button>
        </Card>
      </div>
    )
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
        <Card className="p-10 space-y-10 rounded-[3.5rem] border-border/50 bg-card/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full transition-transform duration-1000" />
          
          <div className="flex justify-center">
            {status === "loading" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary"
              >
                <Loader2 className="w-8 h-8" />
              </motion.div>
            )}
            
            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 transform rotate-6"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive transform -rotate-6"
              >
                <XCircle className="w-8 h-8" />
              </motion.div>
            )}
          </div>

          <div className="space-y-4 relative z-10">
            <h1 className="text-2xl font-extrabold tracking-tighter">
              {status === "loading" && "Syncing Protocol..."}
              {status === "success" && "Identity Verified"}
              {status === "error" && "Verification Failed"}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {message}
            </p>
          </div>

          <div className="relative z-10 pt-4">
            {status === "success" && (
              <Button 
                onClick={() => router.push("/login")}
                variant="premium" 
                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 uppercase text-[10px] tracking-widest"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Activate Login
              </Button>
            )}
            
            {status === "error" && (
              <Button 
                onClick={() => router.push("/login")}
                variant="outline" 
                className="w-full h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-border/50"
              >
                Return to Node
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
       <div className="min-h-[80vh] flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  )
}
