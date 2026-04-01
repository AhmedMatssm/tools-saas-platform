"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Target, Rocket, Users, Shield, Zap, Globe, Heart } from "lucide-react"
import { motion } from "framer-motion"

const values = [
  { title: "Creativity First", desc: "We build tools that dissolve the technical barriers between thought and reality.", icon: Sparkles },
  { title: "Privacy & Ethics", desc: "Your data is yours. We strictly follow ethical AI guidelines in all our models.", icon: Shield },
  { title: "Global Access", desc: "Democratizing high-end AI technology for creators everywhere.", icon: Globe },
  { title: "Passion for Excellence", desc: "Every pixel, every prompt, and every line of code is built with care.", icon: Heart },
]

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
       {/* 1. HERO MISSION */}
       <section className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 py-1 px-4 rounded-full text-xs font-black uppercase tracking-widest text-blue-500"
          >
            <Target className="w-3 h-3" />
            Our Mission
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight"
          >
            Empowering <span className="text-gradient">Every Creator</span> <br />
            with the Future of AI.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            We believe that AI should be a partner in creativity, not a replacement. 
            AI Flux was founded in 2024 to provide professional-grade AI tools with 
            unmatched UX and speed.
          </motion.p>
       </section>

       {/* 2. VISION GRID */}
       <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
             <h2 className="text-4xl font-bold">A Vision of <span className="text-blue-500">Unbounded Potential.</span></h2>
             <p className="text-muted-foreground tracking-wide leading-relaxed">
                In a world where digital content is evolving at lightning speed, 
                AI Flux stands at the intersection of powerful neural networks and 
                human-centric design. We aren't just building tools; we're building 
                the next-gen creative engine of the internet.
             </p>
             <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2 group">
                   <div className="w-10 h-10 bg-surface-hover rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Zap className="w-5 h-5 text-blue-500 group-hover:text-white" />
                   </div>
                   <h4 className="font-bold">Real-time Generation</h4>
                   <p className="text-xs text-muted-foreground">The world's fastest inference engine at your fingertips.</p>
                </div>
                <div className="space-y-2 group">
                   <div className="w-10 h-10 bg-surface-hover rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Rocket className="w-5 h-5 text-blue-500 group-hover:text-white" />
                   </div>
                   <h4 className="font-bold">Scaleable Architecture</h4>
                   <p className="text-xs text-muted-foreground">From indie creators to Fortune 500 agencies.</p>
                </div>
             </div>
          </div>
          <div className="relative order-1 lg:order-2 group">
             <div className="absolute inset-x-0 bottom-0 top-0 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000" />
             <Card variant="glass" className="aspect-square flex items-center justify-center relative shadow-2xl overflow-hidden border-2 border-white/5">
                <div className="w-40 h-40 bg-gradient-premium rounded-3xl flex items-center justify-center animate-bounce shadow-2xl shadow-blue-500/40">
                   <Sparkles className="text-white w-20 h-20" />
                </div>
                {/* Decoration blobs */}
                <div className="absolute top-10 right-10 w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
                <div className="absolute bottom-10 left-10 w-6 h-6 rounded-full bg-purple-500 animate-pulse delay-150" />
             </Card>
          </div>
       </section>

       {/* 3. CORE VALUES */}
       <section className="space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-4xl font-black">Our <span className="text-blue-500 text-gradient">Core Values</span></h2>
             <p className="text-muted-foreground">The principles that guide every decision we make.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {values.map((v, i) => (
               <motion.div
                 key={v.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
               >
                 <Card className="p-8 h-full space-y-6 hover:translate-y-[-8px] transition-transform duration-500 border-white/5 bg-surface-hover/30">
                    <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center">
                       <v.icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-lg font-bold">{v.title}</h4>
                       <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                 </Card>
               </motion.div>
             ))}
          </div>
       </section>

       {/* 4. STORY BLOCK */}
       <section className="max-w-3xl mx-auto space-y-8 bg-surface-hover/20 p-12 md:p-16 rounded-3xl border border-white/5 shadow-2xl text-center">
          <h2 className="text-3xl font-black">The Story of <span className="text-blue-500">Flux</span></h2>
          <p className="text-muted-foreground leading-relaxed italic">
             "We started in a small room with a large vision: to take the complex neural 
             models and place them inside a tool that feels like magic. Today, AI Flux is 
             used by over 100,000 creators to generate over 10 million images every month."
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
             <div className="w-12 h-12 rounded-full bg-gradient-premium border-2 border-white/20 shadow-xl" />
             <div className="text-left">
                <p className="text-sm font-bold text-white">Alex Rivers</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Founder & CEO</p>
             </div>
          </div>
       </section>
    </div>
  )
}
