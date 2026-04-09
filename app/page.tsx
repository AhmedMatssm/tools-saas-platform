"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import {
  Sparkles, Wand2, Image as ImageIcon, Zap, ChevronRight,
  Play, ExternalLink, Bolt, Users, TrendingUp, Globe,
  ArrowRight, Film, Mic, FileText
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CommunityShowcase } from "@/components/layout/community-showcase"

// ── Animated counter hook ──────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || target === 0) return
    const steps = 60
    const stepMs = duration / steps
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setCount(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, stepMs)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { count, ref }
}

const PROMPTS = [
  "A bioluminescent forest under a purple moon...",
  "Futuristic cyberpunk city in cinematic rain...",
  "Portrait of a neon samurai at dusk...",
  "Cosmic nebula painted in oils and fire...",
  "Medieval castle on a floating island...",
]

const CATEGORIES = [
  { label: "Image", icon: ImageIcon },
  { label: "Text", icon: FileText },
  { label: "Video", icon: Film },
  { label: "Voice", icon: Mic },
]

const FEATURES = [
  {
    title: "Ultra-Fast",
    desc: "Leverage our distributed GPU cloud to generate high-resolution assets in under 3 seconds. No waiting queues, just results.",
    icon: Bolt,
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "hover:border-primary/30",
  },
  {
    title: "No Friction",
    desc: "Start creating immediately. We respect your flow — no mandatory sign-ups, no complex onboarding, no friction.",
    icon: Sparkles,
    accent: "text-secondary",
    bg: "bg-secondary/10",
    border: "hover:border-secondary/30",
  },
  {
    title: "Always Free",
    desc: "The Astral Foundation covers the core costs. Use our standard model for free, forever. No credit card required.",
    icon: Zap,
    accent: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "hover:border-emerald-400/30",
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Marketing: "text-secondary",
  Gaming: "text-primary",
  Design: "text-emerald-400",
  General: "text-yellow-400",
  Technology: "text-blue-400",
  Tutorial: "text-orange-400",
}

// ── Analytics stat card ────────────────────────────────────────
function StatCard({
  label, value, suffix = "", icon: Icon, delay = 0
}: {
  label: string
  value: number
  suffix?: string
  icon: React.ElementType
  delay?: number
}) {
  const { count, ref } = useCounter(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-8 h-full border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/30 rounded-3xl transition-all group">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-400 opacity-60" />
        </div>
        <span ref={ref} className="block text-5xl font-black tracking-tighter text-white">
          {count.toLocaleString()}{suffix}
        </span>
        <p className="mt-2 text-sm text-muted-foreground font-medium uppercase tracking-widest">{label}</p>
      </Card>
    </motion.div>
  )
}

export default function LandingPage() {
  const [prompt, setPrompt] = useState("")
  const [promptIdx, setPromptIdx] = useState(0)
  const [activeCategory, setActiveCategory] = useState("Image")
  const [stats, setStats] = useState({ totalUsers: 0, totalGenerations: 0, totalBlogs: 0 })
  const [recentImages, setRecentImages] = useState<any[]>([])
  const [latestPosts, setLatestPosts] = useState<any[]>([])
  const router = useRouter()

  // Rotating placeholder
  useEffect(() => {
    const id = setInterval(() => setPromptIdx(i => (i + 1) % PROMPTS.length), 4000)
    return () => clearInterval(id)
  }, [])

  // Real stats from DB
  useEffect(() => {
    axios.get("/api/stats").then(r => {
      if (r.data) setStats(r.data)
    }).catch(() => {})
  }, [])

  // Recent community images for bento grid
  useEffect(() => {
    axios.get("/api/community?page=1&limit=4").then(r => {
      if (r.data.success && r.data.images?.length) {
        setRecentImages(r.data.images)
      }
    }).catch(() => {})
  }, [])

  // Latest blog posts for homepage
  useEffect(() => {
    axios.get("/api/blog?limit=3").then(r => {
      if (r.data.success && r.data.blogs?.length) setLatestPosts(r.data.blogs)
    }).catch(() => {})
  }, [])

  const handleGenerate = () => {
    router.push(prompt.trim() ? `/generate?prompt=${encodeURIComponent(prompt)}` : "/generate")
  }

  return (
    <div className="w-full bg-background selection:bg-primary/20">

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <main>
        <section className="relative pt-40 pb-24 overflow-hidden px-6" aria-label="Hero Section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_top,rgba(163,100,255,0.10)_0%,transparent_70%)] -z-10" />
        <div className="max-w-7xl mx-auto text-center">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 border border-border/20 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_theme(colors.secondary)]" />
            <span className="text-xs font-medium text-secondary tracking-wider uppercase">
              {stats.totalGenerations > 0
                ? `${stats.totalGenerations.toLocaleString()} workflows automated`
                : "The Best AI Tools Platform"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-6 max-w-5xl mx-auto">
            Supercharge Growth <br className="hidden md:block" />
            with <span className="text-gradient">Astryxo</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Access the world's most powerful enterprise-grade AI tools platform. Automate complex workflows, unify your data, and unlock elite AI productivity tools instantly.
          </motion.p>

          {/* Prompt Input */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mx-auto relative group mb-12">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex flex-col md:flex-row gap-2 p-2 rounded-2xl bg-card/80 border border-border/20 backdrop-blur-xl shadow-2xl">
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGenerate()}
                placeholder={PROMPTS[promptIdx]}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 placeholder:italic px-6 py-4 text-lg"
              />
              <Button onClick={handleGenerate} variant="premium"
                className="rounded-xl px-8 h-14 text-base font-black uppercase tracking-widest gap-2 shrink-0 active:scale-95 transition-all">
                Explore Tools <Wand2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* ── Quick-start prompts below input ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-1">Try:</span>
            {[
              "Marketing copy automation",
              "Customer support AI routing",
              "Predictive data analytics modeling",
              "Generative email sequences",
              "AI code review assistance",
            ].map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-card/60 border border-border/20 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card transition-all active:scale-95"
              >
                {p}
              </button>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── 4. MARKETING STATISTICS ──────────────────────── */}
      <section className="py-24 px-6 mb-8" aria-label="Platform Statistics">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 animate-pulse">
              Platform Metrics
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              The Numbers <span className="text-gradient">Don&apos;t Lie</span>
            </motion.h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Live metrics from our platform, updated in real time. Trusted by creators across 40+ countries.
            </p>
          </div>

          {/* Big stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                display: stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : "12,000+",
                label: "Registered Creators",
                sub: "Growing 30% monthly",
                icon: Users,
                accent: "text-primary",
                bg: "from-primary/10 to-primary/5",
              },
              {
                display: stats.totalGenerations > 0 ? stats.totalGenerations.toLocaleString() : "480,000+",
                label: "Tasks Automated",
                sub: "across global SaaS nodes",
                icon: Sparkles,
                accent: "text-secondary",
                bg: "from-secondary/10 to-secondary/5",
              },
              {
                display: "99.9%",
                label: "Platform Uptime",
                sub: "SLA guaranteed",
                icon: TrendingUp,
                accent: "text-emerald-400",
                bg: "from-emerald-400/10 to-emerald-400/5",
              },
              {
                display: stats.totalBlogs > 0 ? stats.totalBlogs.toString() : "60+",
                label: "Articles Published",
                sub: "Weekly new content",
                icon: FileText,
                accent: "text-yellow-400",
                bg: "from-yellow-400/10 to-yellow-400/5",
              },
            ].map(({ display, label, sub, icon: Icon, accent, bg }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className={`p-6 h-full border-border/30 bg-gradient-to-br ${bg} backdrop-blur-xl hover:border-primary/20 rounded-3xl transition-all group`}>
                  <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${accent} mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={`text-4xl md:text-5xl font-black tracking-tighter ${accent}`}>{display}</p>
                  <p className="mt-2 text-sm font-black text-foreground">{label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Secondary highlights row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { stat: "< 3s", label: "Average API response time", icon: Zap, accent: "text-primary" },
              { stat: "99%", label: "Task success pipeline rate", icon: TrendingUp, accent: "text-secondary" },
              { stat: "1,200+", label: "B2B SaaS integrations", icon: Globe, accent: "text-emerald-400" },
            ].map(({ stat, label, icon: Icon, accent }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}>
                <div className="flex items-center gap-5 p-6 rounded-2xl bg-card/30 border border-border/15 hover:bg-card/50 hover:border-border/30 transition-all">
                  <div className={`w-10 h-10 rounded-xl bg-card/60 flex items-center justify-center ${accent} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${accent}`}>{stat}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. FEATURES ──────────────────────────────────── */}
      <section className="py-32 border-y border-border/10 bg-card/10 mb-32" aria-label="Core Features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Unmatched Power
            </motion.h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Engineered for elite enterprises demanding uncompromising security, rapid integration, and the highest-performing AI productivity tools on the market.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className={`p-8 h-full border-border/40 bg-card/40 backdrop-blur-xl ${f.border} rounded-3xl transition-all hover:-translate-y-1 group`}>
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center ${f.accent} mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 6. COMMUNITY SHOWCASE ───────────────────────── */}
      <CommunityShowcase lovedOnly={true} hideHearts={true} />

      {/* ── 7. USE CASES ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-32" aria-label="Use Cases and Blog Posts">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Empowering Every Industry
            </motion.h2>
            <p className="text-muted-foreground text-lg">
              From fast-scaling startups to global agencies, Astryxo is the robust SaaS AI platform driving backend innovation.
            </p>
          </div>
          <Link href="/blog"
            className="flex items-center gap-2 text-primary font-black text-sm hover:gap-4 transition-all whitespace-nowrap">
            View all case studies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {latestPosts.length > 0 ? latestPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link href={`/blog/${post.slug}`}
                className="relative rounded-3xl overflow-hidden aspect-[4/5] group block">
                <Image
                  src={post.image || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop"}
                  alt={`Cover image for ${post.title}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <span className={`text-xs font-black uppercase tracking-widest mb-2 block ${CATEGORY_COLORS[post.category] || "text-primary"}`}>
                    {post.category}
                  </span>
                  <h4 className="font-black text-xl text-white leading-tight line-clamp-2">{post.title}</h4>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    {post.readTime > 0 && <span>{post.readTime} min read</span>}
                    {post.readTime > 0 && post.views > 0 && <span>·</span>}
                    {post.views > 0 && <span>{post.views.toLocaleString()} views</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          )) : [0, 1, 2].map(i => (
            <div key={i} className="rounded-3xl overflow-hidden aspect-[4/5] bg-card/30 border border-border/10 animate-pulse" />
          ))}
        </div>
      </section>

      {/* ── 9. CTA ──────────────────────────────────────── */}
      <section className="px-6 mb-32">
        <div className="max-w-7xl mx-auto relative p-12 md:p-24 rounded-[3rem] overflow-hidden bg-card/40 border border-border/10 text-center backdrop-blur-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              Transform Your Workflow Today
            </motion.h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-12">
              Join {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() + "+" : "10,000+"} businesses scaling efficiently on the ultimate AI tools platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="premium"
                  className="w-full sm:w-auto px-10 py-6 h-auto rounded-2xl text-lg font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  Activate Astryxo Console
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline"
                  className="w-full sm:w-auto px-10 py-6 h-auto rounded-2xl text-lg font-black uppercase tracking-widest active:scale-95 transition-all">
                  Explore the Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>

    </div>
  )
}
