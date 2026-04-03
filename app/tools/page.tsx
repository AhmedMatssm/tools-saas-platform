"use client"

import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { 
  Search, 
  ChevronRight, 
  Image as ImageIcon, 
  Video, 
  Type, 
  Code, 
  Wand2, 
  Lock
} from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

const categories = ["All", "Visuals", "Text", "Code"]

const tools = [
  { id: 1, name: "Image Generator", href: "/generate", category: "Visuals", desc: "Our flagship image model with ultra-precise prompt adherence.", icon: ImageIcon, isLive: true },
  { id: 2, name: "Video Flow", href: "#", category: "Visuals", desc: "Generate smooth transitions and motion from prompt or still images.", icon: Video, isLive: false },
  { id: 3, name: "Neural Edit", href: "#", category: "Visuals", desc: "In-paint and out-paint existing generations with natural blending.", icon: Wand2, isLive: false },
  { id: 4, name: "Copywriter AI", href: "#", category: "Text", desc: "Advanced AI copywriting for social media, marketing, and SEO.", icon: Type, isLive: false },
  { id: 5, name: "Code Assistant", href: "#", category: "Code", desc: "Write documentation, refactor algorithms, and debug syntax securely.", icon: Code, isLive: false },
]

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")

  const filteredTools = tools.filter(t => 
    (activeCategory === "All" || t.category === activeCategory) &&
    (t.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black">Browse AI <span className="text-blue-500">Flux Tools</span></h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Everything you need to create, edit, and build with AI in one place. 
          Discover our collection of specialized models.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 sticky top-24 z-10 p-2 glass rounded-2xl border border-white/5 transition-all shadow-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for a specific tool..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border p-3 pl-12 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar scroll-smooth">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "ghost"}
              onClick={() => setActiveCategory(cat)}
              className="px-6 rounded-xl capitalize shadow-sm text-xs font-semibold whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className={`flex flex-col h-full bg-surface/40 hover:bg-surface border-white/5 transition-all duration-300 shadow-xl overflow-hidden relative group md:hover:scale-[1.02] ${tool.isLive ? "hover:border-primary/50" : "opacity-60 cursor-not-allowed hover:border-white/10"}`}>
                 {!tool.isLive && (
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
                 )}
                <div className="p-8 space-y-6 flex-1 relative z-20">
                  <div className="flex items-center justify-between">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 scale-100 ${tool.isLive ? "bg-primary/10 text-primary group-hover:bg-primary/20" : "bg-white/5 text-muted-foreground"}`}>
                       <tool.icon className="w-7 h-7" />
                     </div>
                     {!tool.isLive && (
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                           <Lock className="w-3 h-3 text-muted-foreground" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Soon</span>
                        </div>
                     )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       {tool.isLive ? (
                          <Link href={tool.href} className="flex-1 flex items-center justify-between before:absolute before:inset-0 before:z-10">
                             <h3 className="text-xl font-bold transition-colors text-white group-hover:text-primary">{tool.name}</h3>
                             <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </Link>
                       ) : (
                          <h3 className="text-xl font-bold transition-colors text-white/70">{tool.name}</h3>
                       )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/5 p-4 bg-black/20 flex items-center justify-between relative z-20">
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${tool.isLive ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-muted-foreground border-white/5"}`}>
                     {tool.category}
                   </span>
                   {tool.isLive ? (
                     <Link href={tool.href}>
                        <Button variant="ghost" size="sm" className="text-xs font-black text-primary hover:text-white uppercase tracking-tighter hover:bg-transparent">
                           Launch Tool
                        </Button>
                     </Link>
                   ) : (
                     <Button disabled variant="ghost" size="sm" className="text-xs font-black text-white/30 uppercase tracking-tighter cursor-not-allowed hidden md:block">
                        Locked
                     </Button>
                   )}
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-700">
               <Search className="w-8 h-8 text-gray-700" />
            </div>
             <p className="text-xl font-bold text-white">No tools match your search</p>
             <p className="text-muted-foreground">Try using different keywords or checking another category.</p>
             <Button variant="outline" onClick={() => {setSearch(""); setActiveCategory("All")}}>Reset Filters</Button>
          </div>
        )}
      </div>

    </div>
  )
}
