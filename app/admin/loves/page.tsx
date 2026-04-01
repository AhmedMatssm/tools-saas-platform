"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { Sparkles, Copy, Trash2, Loader2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLovesPage() {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchLoves()
  }, [])

  const fetchLoves = async () => {
    setIsLoading(true)
    try {
      const resp = await axios.get("/api/community?lovedOnly=true&limit=100")
      if (resp.data.success) {
        setImages(resp.data.images)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfeature = async (id: string) => {
    setTogglingId(id)
    try {
      const resp = await axios.post("/api/admin/toggle-love", { generationId: id, isLoved: false })
      if (resp.data.success) {
        setImages(prev => prev.filter(img => img.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-6 font-bold uppercase tracking-widest text-[10px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Editor&apos;s Choices</span>
        </div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-center uppercase leading-none mb-6">
          Curated <span className="text-primary italic">Loves</span>
        </h1>
        <p className="max-w-2xl text-center text-muted-foreground text-xs font-bold uppercase tracking-widest leading-loose opacity-70">
          This is your exclusive collection of platform highlights. Use this space to review and manage featured visions.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-primary border border-white/5 rounded-[3rem] bg-white/[0.02] animate-pulse">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synching with the Aura...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border border-white/5 rounded-[3rem] bg-white/[0.02]">
             <Heart className="w-16 h-16 mb-6 opacity-10" />
             <p className="text-[10px] font-black uppercase tracking-widest text-center">No curated visions found.<br/>Go to Manifestation Logs to heart some visions.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
             {images.map((img, i) => (
                <motion.div 
                   key={img.id}
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                   className="relative break-inside-avoid rounded-[2.5rem] overflow-hidden group border border-white/5 bg-black/40 shadow-2xl"
                >
                   <img src={img.imageUrl} alt={img.prompt} className="w-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                   
                   <div className="absolute top-4 right-4 z-10 transition-all duration-300 opacity-100">
                     <button 
                       onClick={() => handleUnfeature(img.id)}
                       disabled={togglingId === img.id}
                       className="p-2.5 rounded-full backdrop-blur-xl border transition-all active:scale-90 bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30"
                     >
                       {togglingId === img.id ? (
                         <Loader2 className="w-4 h-4 animate-spin" />
                       ) : (
                         <Heart className="w-4 h-4 fill-current" />
                       )}
                     </button>
                   </div>

                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                      <p className="text-white text-xs font-bold line-clamp-3 leading-relaxed opacity-90">{img.prompt}</p>
                   </div>
                </motion.div>
             ))}
          </div>
        )}
      </div>
    </main>
  )
}
