"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// In newer lucide-react, brand icons were removed. Using minimal SVGs instead.
function TwitterIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

function LinkedinIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tweet = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`, "_blank")
  }

  const linkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank")
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Share</span>
      <Button variant="outline" size="icon" onClick={tweet} className="rounded-xl w-10 h-10 hover:bg-primary/10 hover:text-primary transition-colors hover:border-primary/30">
        <TwitterIcon className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={linkedin} className="rounded-xl w-10 h-10 hover:bg-blue-500/10 hover:text-blue-500 transition-colors hover:border-blue-500/30">
        <LinkedinIcon className="w-4 h-4" />
      </Button>
      <div className="relative">
        <Button variant="outline" size="icon" onClick={copy} className="rounded-xl w-10 h-10 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors hover:border-emerald-500/30 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div key="check" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute">
                <Check className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute">
                <Copy className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  )
}
