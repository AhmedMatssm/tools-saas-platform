"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { Input } from "@/components/common/input"
import { Sparkles, Download, Share2, Copy, Trash2, Wand2, Loader2, Image as ImageIcon, Zap } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import { showToast } from "@/utils/toast"
import { useSession } from "next-auth/react"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCredits } from "@/hooks/use-credits"

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const { credits, isLoading: creditsLoading, refetch: refetchCredits } = useCredits()
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt") || ""
  
  const [prompt, setPrompt] = useState(initialPrompt)
  const [model, setModel] = useState<"fast" | "quality" | "creative">("fast")
  const [isGenerating, setIsGenerating] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const noCredits = credits !== null && credits <= 0

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!session) {
      showToast("Please sign in to generate images.", "error")
      return
    }
    if (noCredits) {
      showToast("No credits remaining. Earn more credits to continue.", "error")
      return
    }
    setIsGenerating(true)
    setError(null)

    try {
      const resp = await axios.post("/api/generate", { prompt, model })

      if (resp.data.success) {
        setImage(resp.data.imageUrl)
        // Always revalidate credits from server after generation
        await refetchCredits()
      }
    } catch (err: any) {
      console.error("GEN:", err)
      const msg = err.response?.data?.error || "Manifestation failed. Please try again."
      setError(msg)
      showToast(msg, "error")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!image) return
    try {
      // Robust download for base64
      const parts = image.split(";base64,")
      const contentType = parts[0].split(":")[1]
      const raw = window.atob(parts[1])
      const rawLength = raw.length
      const uInt8Array = new Uint8Array(rawLength)

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
      }

      const blob = new Blob([uInt8Array], { type: contentType })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `manifestation-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("DOWNLOAD_ERROR:", err)
    }
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      showToast("Prompt copied to clipboard", "success")
    } catch {
      showToast("Failed to copy prompt", "error")
    }
  }

  const handleShare = async () => {
    if (!image) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ASTRAL AI Manifestation",
          text: `Check out this AI art I manifested: ${prompt}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Share failed", err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        showToast("Link copied to clipboard", "success")
      } catch {
        showToast("Could not copy link", "error")
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left: Input */}
        <div className="lg:col-span-5 space-y-8">
           <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight">AI Image <span className="text-primary">Generator</span></h1>
              <p className="text-muted-foreground text-sm">Describe your vision and watch the AI manifest it in seconds.</p>
           </div>

           <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-xl border-border/50">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">The Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cinematic drone shot of a neon city under heavy rain, cyberpunk style..."
                  className="w-full h-40 bg-background border border-border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Model Style</label>
                 <div className="grid grid-cols-3 gap-2">
                    {["fast", "quality", "creative"].map((m) => (
                      <button 
                        key={m}
                        onClick={() => setModel(m as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                          model === m ? "bg-primary text-white border-primary" : "bg-card border-border hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                         {m === "fast" && <Sparkles className="w-3 h-3 mx-auto mb-1" />}
                         {m}
                      </button>
                    ))}
                 </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* No credits warning */}
              {noCredits && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  No credits remaining
                </motion.div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt || noCredits}
                variant="premium" 
                className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                 {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                 {isGenerating ? "Manifesting..." : noCredits ? "No Credits" : "Generate Magic"}
              </Button>

              <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                 <span className={noCredits ? "text-amber-400" : ""}>
                   {creditsLoading ? "Loading credits…" :
                     credits !== null ? `${credits} credit${credits !== 1 ? "s" : ""} remaining` :
                     "Credits refresh daily"}
                 </span>
                 <Link href="/pricing" className="text-primary cursor-pointer hover:underline">Earn Credits</Link>
              </div>
           </Card>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center min-h-[500px]">
           {!image && !isGenerating ? (
             <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-[3rem] text-center space-y-4 opacity-50">
                <ImageIcon className="w-20 h-20 text-muted-foreground" />
                <p className="text-lg font-bold">Your manifestion will appear here.</p>
             </div>
           ) : isGenerating ? (
             <div className="w-full aspect-square max-w-2xl bg-secondary/20 rounded-[3rem] animate-pulse flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Engaging Astral Engine...</p>
                </div>
             </div>
           ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full space-y-6"
             >
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white/5">
                   <img src={image!} alt="Generated manifestation" className="w-full h-auto object-cover" />
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                   <Button onClick={handleDownload} variant="outline" className="rounded-xl px-6 h-12 gap-2"><Download className="w-4 h-4" /> Download</Button>
                   <Button onClick={handleShare} variant="outline" className="rounded-xl px-6 h-12 gap-2"><Share2 className="w-4 h-4" /> Share</Button>
                   <Button onClick={handleCopyPrompt} variant="outline" className="rounded-xl px-6 h-12 gap-2"><Copy className="w-4 h-4" /> Copy Prompt</Button>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  )
}
