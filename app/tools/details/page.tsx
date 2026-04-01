"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Wand2, 
  Sparkles, 
  Clock, 
  Zap, 
  Shield, 
  Share2, 
  Heart, 
  Bookmark, 
  ChevronRight, 
  Play, 
  ImageIcon 
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ToolDetailsPage() {
  const specs = [
    { label: "Model Type", value: "Generative Neural", icon: Sparkles },
    { label: "Avg Latency", value: "<1.2 Seconds", icon: Zap },
    { label: "Stability", value: "99.98% SLA", icon: Shield },
    { label: "Updated", value: "v4.2.0 stable", icon: Clock },
  ]

  const related = [
    { name: "FluxImage Gen", icon: ImageIcon, cat: "Generation" },
    { name: "Neural Edit", icon: Wand2, cat: "Editing" },
    { name: "Magic Upscale", icon: Sparkles, cat: "Post-Processing" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-24">
       {/* Breadcrumbs / Back */}
       <Link href="/tools" className="inline-flex items-center gap-2 group text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Directory</span>
       </Link>

       {/* Hero Split */}
       <section className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                      <Wand2 className="text-white w-8 h-8" />
                   </div>
                   <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full bg-surface hover:bg-surface-hover border border-white/5">
                         <Heart className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full bg-surface hover:bg-surface-hover border border-white/5">
                         <Bookmark className="w-4 h-4 text-gray-500 hover:text-blue-500 transition-colors" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full bg-surface hover:bg-surface-hover border border-white/5">
                         <Share2 className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
                      </Button>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <h1 className="text-4xl md:text-6xl font-black">Style <span className="text-blue-500">Flux Pro</span></h1>
                      <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20">Active Beta</span>
                   </div>
                   <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                      Transform any snapshot into a high-end cinematic masterpiece. 
                      Our ultra-high precision style-transfer engine maintains complex geometry 
                      while applying professional grade artistic aesthetics.
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {specs.map(spec => (
                  <Card key={spec.label} className="p-6 space-y-3 bg-surface-hover/30 border-white/5 hover:border-blue-500/50 transition-colors transition-transform hover:translate-y-[-2px]">
                     <div className="w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center">
                        <spec.icon className="w-4 h-4 text-blue-500" />
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{spec.label}</p>
                        <p className="text-sm font-bold text-white">{spec.value}</p>
                     </div>
                  </Card>
                ))}
             </div>

             <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/generator" className="flex-1">
                   <Button variant="premium" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-2xl">
                      Open Tool
                   </Button>
                </Link>
                <Link href="/pricing" className="flex-1">
                   <Button variant="outline" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[2px]">
                      View Commercial License
                   </Button>
                </Link>
             </div>
          </div>

          <div className="relative group">
             <div className="absolute inset-x-0 bottom-0 top-0 bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-[2s]" />
             <Card variant="glass" className="aspect-square relative overflow-hidden rounded-[40px] border-2 border-white/10 shadow-3xl group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" 
                  alt="Feature Preview" 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6">
                   <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                      <Play className="text-white w-8 h-8 fill-white ml-1 shadow-lg shadow-white/20" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-[3px] text-white">Watch Neural Breakdown</p>
                </div>
                <div className="absolute top-8 left-8 p-3 glass border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
                   Before & After
                </div>
             </Card>
          </div>
       </section>

       {/* Secondary Content */}
       <section className="grid lg:grid-cols-3 gap-16 pt-24 border-t border-border">
          <div className="lg:col-span-2 space-y-12">
             <div className="space-y-6">
                <h2 className="text-3xl font-bold">In-Depth <span className="text-blue-500">Workflow</span></h2>
                <p className="text-muted-foreground leading-relaxed">
                   Style Flux Pro uses a multi-layered latent space approach to understand 
                   the semantic structure of your image before applying stylistic changes. 
                   This prevents the 'melting' artifacts seen in traditional generative models.
                </p>
                <ul className="space-y-6">
                   {[
                     { t: "Structural Locking", d: "Maintains facial and architectural proportions with 99.9% accuracy." },
                     { t: "Dynamic Palette Mapping", d: "Automatically extracts color keys from target styles for harmonious blending." },
                     { t: "High Resolution Output", d: "Native 4K rendering without the need for post-process upscaling." }
                   ].map((item, i) => (
                     <li key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 mt-1">
                           {i + 1}
                        </div>
                        <div className="space-y-1">
                           <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors uppercase tracking-widest">{item.t}</h4>
                           <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.d}</p>
                        </div>
                     </li>
                   ))}
                </ul>
             </div>
          </div>

          <aside className="space-y-12 h-fit">
             <h3 className="text-xl font-bold flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Related Tools
             </h3>
             <div className="space-y-6">
                {related.map(r => (
                  <Card key={r.name} className="p-6 flex items-center gap-6 group hover:translate-x-2 transition-transform border-white/5 bg-surface-hover/30">
                     <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <r.icon className="w-6 h-6 text-blue-500 group-hover:text-white" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{r.cat}</p>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{r.name}</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                ))}
             </div>
             
             <Card variant="glass" className="p-8 space-y-6 text-center border-dashed border-blue-500/20">
                <h4 className="text-lg font-bold">Need a custom model?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed italic">"We built Style Flux for specific agency workflows in under 48 hours for our beta partners."</p>
                <Button variant="secondary" className="w-full text-[10px] font-black uppercase tracking-widest rounded-xl">Contact Dev Team</Button>
             </Card>
          </aside>
       </section>
    </div>
  )
}
