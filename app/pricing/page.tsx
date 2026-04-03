"use client"

import { useSession } from "next-auth/react"
import { useCredits } from "@/hooks/use-credits"
import { motion } from "framer-motion"
import { Zap, Gift, Star, ShoppingCart, Clock, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/common/button"
import Link from "next/link"

export default function PricingPage() {
  const { data: session } = useSession()
  const { credits, userData, isLoading } = useCredits()

  const creditPacks = [
    { credits: 25, label: "Starter Pack", icon: Zap, color: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20", badge: null },
    { credits: 100, label: "Creator Pack", icon: Sparkles, color: "from-primary/10 to-primary/5", border: "border-primary/30", badge: "Most Popular" },
    { credits: 300, label: "Pro Pack", icon: Star, color: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/20", badge: "Best Value" },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-24 space-y-20">

      {/* Header */}
      <div className="text-center space-y-5">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tighter">
          Credits <span className="text-primary">Economy</span>
        </motion.h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          One credit = one generation. No subscriptions, no plans, no hidden fees. Use what you need.
        </p>
        {session && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest">
              {isLoading ? "Loading..." : `${credits ?? 0} credits remaining`}
            </span>
          </motion.div>
        )}
      </div>

      {/* Credit Packs (placeholder — no payment integration) */}
      <div>
        <h2 className="text-center text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-10">Buy Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {creditPacks.map((pack, idx) => (
            <motion.div key={pack.label}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
              className={`relative p-8 rounded-[2rem] border bg-gradient-to-br ${pack.color} ${pack.border} backdrop-blur-xl flex flex-col gap-6 shadow-xl`}>
              {pack.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                  {pack.badge}
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <pack.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{pack.label}</p>
                  <p className="text-3xl font-black">{pack.credits} <span className="text-xl text-muted-foreground font-medium">credits</span></p>
                </div>
              </div>
              <Button disabled className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-50 cursor-not-allowed">
                <ShoppingCart className="w-4 h-4 mr-2" /> Coming Soon
              </Button>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest">Payment integration coming soon. Earn credits for free in the meantime.</p>
      </div>

      {/* Free Credits Section */}
      <div className="space-y-8">
        <h2 className="text-center text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Earn Free Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Daily Login */}
          <div className="p-8 rounded-[2rem] border border-border bg-card/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Daily Login Reward</p>
                <p className="text-[10px] text-muted-foreground">+1 credit every 24 hours</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                Claim in Dashboard
              </Button>
            </Link>
          </div>

          {/* Referral */}
          <div className="p-8 rounded-[2rem] border border-border bg-card/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Invite a Friend</p>
                <p className="text-[10px] text-muted-foreground">+5 credits per successful referral</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                Get Referral Link
              </Button>
            </Link>
          </div>

        </div>
      </div>

      {/* How it works */}
      <div className="p-10 rounded-[2rem] border border-border bg-card/20 space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">How Credits Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, label: "1 Credit", desc: "= 1 AI image generation" },
            { icon: TrendingUp, label: "Daily Refill", desc: "10 credits auto-added every 24h" },
            { icon: Gift, label: "Earn More", desc: "Invite friends, claim daily rewards" },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-4">
              <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-black">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
