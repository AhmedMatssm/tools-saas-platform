"use client"

import { Card } from "@/components/ui/card"
import { 
  ImageIcon, 
  Video, 
  Sparkles, 
  Wand2, 
  Mic, 
  Code, 
  Type, 
  Palette, 
  Camera, 
  ChevronRight 
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const categories = [
  { name: "Image Generation", icon: ImageIcon, desc: "Create stunning photorealistic images from simple text prompts.", count: 12 },
  { name: "Video Motion", icon: Video, desc: "Add fluid motion and cinematic transitions to your generated stills.", count: 4 },
  { name: "Artistic Styles", icon: Palette, desc: "Access 500+ hand-crafted artistic styles for any creation.", count: 28 },
  { name: "Neural Editing", icon: Wand2, desc: "Professional grade image manipulation with AI precision.", count: 8 },
  { name: "Voice & Audio", icon: Mic, desc: "Clean studio audio and generate high-fidelity speech synthesis.", count: 6 },
  { name: "Smart Productivity", icon: Type, desc: "AI-driven copy, summaries, and marketing automation.", iconProps: "text-blue-500", count: 15 },
  { name: "Code Studio", icon: Code, desc: "Refuse, document, and fix your source code with neural flows.", count: 9 },
  { name: "Photo Upscaling", icon: Camera, desc: "Enhance images to 4K and 8K with zero artifacting.", count: 3 },
]

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-16">
       <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black">Browse <span className="text-gradient">Categories</span></h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Discover specialized AI models grouped by creative use-case. 
            Find the exact flow you need.
          </p>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
             <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
             >
                <Link href={`/tools?category=${cat.name}`}>
                   <Card className="p-10 flex flex-col items-center text-center space-y-8 h-full border-white/5 bg-surface hover:border-blue-500 transition-all duration-500 group shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="w-20 h-20 bg-surface-hover border border-border rounded-3xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-500/30 group-hover:scale-110">
                         <cat.icon className="w-10 h-10 text-blue-500 group-hover:text-white transition-colors" />
                      </div>

                      <div className="space-y-4 relative z-10">
                         <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                         <p className="text-xs text-muted-foreground leading-relaxed italic pr-2">{cat.desc}</p>
                      </div>

                      <div className="pt-4 flex items-center justify-between w-full border-t border-border/50">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cat.count} Tools</span>
                         <ChevronRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                   </Card>
                </Link>
             </motion.div>
          ))}
       </div>

       {/* Newsletter or CTA Section */}
       <Card variant="glass" className="p-12 md:p-20 text-center space-y-6 overflow-hidden relative group mt-32">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-[10s]" />
          <div className="relative space-y-6">
             <h2 className="text-4xl font-black">Can't find a category?</h2>
             <p className="text-muted-foreground text-lg max-w-xl mx-auto">We are constantly training new models. Request a specific category or workflow.</p>
             <button className="bg-white text-black font-black uppercase tracking-widest text-xs px-12 h-14 rounded-2xl shadow-2xl hover:bg-blue-500 hover:text-white transition-all transform hover:translate-y-[-2px]">Request Category</button>
          </div>
       </Card>
    </div>
  )
}
