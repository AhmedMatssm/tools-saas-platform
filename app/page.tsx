"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Wand2, Image as ImageIcon, Zap, ChevronRight, Play, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CommunityShowcase } from "@/components/global/community-showcase"

const PROMPTS = [
  "A futuristic cyberpunk city in 2077...",
  "An ethereal forest with floating islands...",
  "Portrait of a neon samurai in the rain...",
  "An oil painting of a cosmic nebula...",
  "Medieval fantasy castle on a cliff..."
]

export default function LandingPage() {
  const [prompt, setPrompt] = useState("")
  const [promptIdx, setPromptIdx] = useState(0)
  const [platformStats, setPlatformStats] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIdx((prev) => (prev + 1) % PROMPTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await axios.get("/api/stats")
        if (resp.data.success) {
          setPlatformStats(resp.data.data)
        }
      } catch (err) {
        console.error("Stats fail", err)
      }
    }
    fetchStats()
  }, [])

  const handleGenerate = () => {
    if (prompt.trim()) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
    } else {
      router.push("/generate")
    }
  }

  const features = [
    {
      title: "Real-time Manifestation",
      desc: "Watch your words transform into high-fidelity visuals in under 10 seconds.",
      icon: Zap,
      bg: "bg-blue-500/10",
      color: "text-blue-500"
    },
    {
      title: "Community Synergy",
      desc: "Remix and adapt prompts from our top creative minds in the global swarm.",
      icon: ImageIcon,
      bg: "bg-purple-500/10",
      color: "text-purple-500"
    },
    {
      title: "Lossless Exports",
      desc: "Download your manifestations in raw 4K quality for professional use cases.",
      icon: ExternalLink,
      bg: "bg-emerald-500/10",
      color: "text-emerald-500"
    }
  ]

  return (
    <div className="w-full bg-background selection:bg-primary/20">

      {/* ── 1. HERO ── */}
      <section className="relative pt-24 pb-48 overflow-hidden px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.13)_0%,transparent_70%)] -z-10" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10 animate-pulse" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-secondary/10 border border-primary/20 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {platformStats?.totalGenerations ? `${platformStats.totalGenerations.toLocaleString()} visions manifested` : "Now Manifesting Visions Daily"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.88] max-w-5xl">
            From Idea to Art in <br />
            <span className="text-gradient decoration-primary underline underline-offset-[12px] decoration-4">Seconds</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            The ultimate SaaS workstation for AI image generation. High speed, high quality, and a global community to fuel your inspiration.
          </motion.p>

          {/* Prompt Input */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-4xl relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-[3rem] blur-2xl opacity-40 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative glass p-3 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center px-6 gap-4">
                <Sparkles className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleGenerate()}
                  placeholder={PROMPTS[promptIdx]}
                  className="flex-1 bg-transparent border-none outline-none py-6 text-lg md:text-xl placeholder:text-muted-foreground/60 placeholder:italic"
                />
              </div>
              <Button onClick={handleGenerate} variant="premium" className="rounded-[2rem] px-10 h-16 text-lg font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all shrink-0">
                Manifest <Wand2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex items-center gap-6 pt-12">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-secondary transition-transform hover:scale-110 cursor-pointer overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                +{platformStats?.totalUsers ? (platformStats.totalUsers / 1000).toFixed(1) + "k" : "5M"}
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Joined by the world&apos;s elite creators</p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. LOGOS ── */}
      <div className="py-20 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-6 overflow-hidden relative">
            <div className="flex items-center gap-24 animate-shimmer whitespace-nowrap opacity-40">
               {["ADOBE", "NVIDIA", "OPENAI", "STABILITY", "MIDJOURNEY", "CANVA", "PEXELS"].map(brand => (
                 <span key={brand} className="text-2xl font-black tracking-[0.3em] grayscale hover:grayscale-0 transition-all cursor-default">{brand}</span>
               ))}
               {["ADOBE", "NVIDIA", "OPENAI", "STABILITY", "MIDJOURNEY", "CANVA", "PEXELS"].map(brand => (
                 <span key={brand + "2"} className="text-2xl font-black tracking-[0.3em] grayscale hover:grayscale-0 transition-all cursor-default">{brand}</span>
               ))}
            </div>
         </div>
      </div>

      {/* ── 3. SHOWCASE ── */}
      <CommunityShowcase />

      {/* ── 4. FEATURES ── */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Card className="p-12 h-full space-y-10 border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/40 rounded-[3rem] shadow-2xl transition-all hover:-translate-y-2 group">
              <div className={`w-20 h-20 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                <f.icon className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </div>
              <div className="pt-4 flex items-center text-xs font-black uppercase tracking-widest text-primary gap-2 group-hover:gap-4 transition-all">
                Learn Matrix <ChevronRight className="w-4 h-4" />
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* ── 5. VIDEO SECTION ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto relative rounded-[4rem] overflow-hidden group shadow-2xl border border-white/5">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Demo" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
            <Button variant="outline" className="w-24 h-24 rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:scale-110 transition-transform">
               <Play className="w-10 h-10 text-white fill-white" />
            </Button>
          </div>
          <div className="absolute top-12 left-12">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Product Tour</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-2">The Interface <br />of Tomorrow.</h2>
          </div>
        </div>
      </section>

      {/* ── 6. CTA ── */}
      <section className="py-48 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto rounded-[5rem] bg-gradient-premium p-16 md:p-32 text-center relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(59,130,246,0.3)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
          <div className="relative space-y-10 z-10">
            <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
              Ready to redefine <br className="hidden md:block" />your creative horizon?
            </h2>
            <p className="text-blue-100 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Join{platformStats?.totalUsers ? ` ${platformStats.totalUsers.toLocaleString()}` : " thousands of"} creators manifesting the future of art with ASTRAL AI. Start for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
              <Link href="/register">
                <Button variant="secondary" className="w-full sm:w-auto h-20 px-20 text-xl font-black uppercase tracking-widest rounded-3xl shadow-2xl hover:-translate-y-2 active:scale-95 transition-all">
                  Join the Swarm
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto h-20 px-20 text-xl font-black uppercase tracking-widest rounded-3xl active:scale-95 transition-all">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
