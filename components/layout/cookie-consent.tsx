"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Cookie, X, Check, ShieldCheck } from "lucide-react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("astral_cookie_consent")
    if (!consent) {
      // Slight delay so it doesn't flash before the page renders
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("astral_cookie_consent", "accepted")
    setVisible(false)
  }

  const handleRefuse = () => {
    localStorage.setItem("astral_cookie_consent", "refused")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-3xl"
        >
          <div className="relative rounded-[2rem] border border-white/10 bg-[#060b18]/95 backdrop-blur-2xl shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7)] p-6 md:p-8 overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Cookie className="w-7 h-7 text-primary" />
              </div>

              {/* Text */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Spectral Data Notice</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your Astryxo experience, analyze traffic, and personalize content. By clicking <strong className="text-white">Accept</strong>, you consent to our use of cookies.
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  Read our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms</Link>,{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{" "}
                  <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={handleAccept}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" /> Accept All
                </button>
                <button
                  onClick={handleRefuse}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-muted-foreground text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" /> Refuse
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
