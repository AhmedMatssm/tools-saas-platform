"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Sparkles, Plus, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

export function CommunityShowcase() {
  const [images, setImages] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchImages = async (pageNum: number) => {
    setLoading(true)
    try {
      const resp = await axios.get(`/api/community?page=${pageNum}&limit=12`)
      if (resp.data.success) {
        if (pageNum === 1) {
          setImages(resp.data.images)
        } else {
          setImages(prev => [...prev, ...resp.data.images])
        }
        setHasMore(resp.data.pagination.page < resp.data.pagination.pages)
      }
    } catch (error) {
       console.error("Community feed failed", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(1)
  }, [])

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
  }

  const handleRemix = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    router.push(`/generate?prompt=${encodeURIComponent(text)}`)
  }

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center space-y-4 mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Community Creations</p>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">What Creators <span className="text-primary italic">Manifest</span></h2>
      </div>

      {images.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border border-white/5 rounded-[3rem] bg-white/[0.02]">
           <Camera className="w-16 h-16 mb-6 opacity-20" />
           <p className="text-sm font-black uppercase tracking-widest text-center">The gallery is currently empty.<br/>Be the first to manifest a vision.</p>
           <Button onClick={() => router.push("/generate")} variant="premium" className="mt-8 rounded-full h-12 px-8 font-black uppercase tracking-widest text-xs">
              Start Generating
           </Button>
        </div>
      ) : (
        <>
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {images.map((img, i) => (
              <motion.div 
                 key={img.id + i} 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ duration: 0.5, delay: (i % 12) * 0.05 }}
                 className="relative break-inside-avoid rounded-[2rem] overflow-hidden group shadow-2xl border border-white/5 bg-black"
              >
                <img 
                   src={img.imageUrl} 
                   alt={img.prompt} 
                   loading="lazy" 
                   className="w-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                   <p className="text-white text-xs font-black line-clamp-4 mb-4 leading-relaxed tracking-tight">{img.prompt}</p>
                   <div className="flex items-center gap-2">
                      <Button onClick={(e) => handleCopy(e, img.prompt)} variant="secondary" size="sm" className="h-9 flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 text-xs">
                         <Copy className="w-3.5 h-3.5 mr-2" /> Copy
                      </Button>
                      <Button onClick={(e) => handleRemix(e, img.prompt)} variant="premium" size="sm" className="h-9 flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 text-xs">
                         <Sparkles className="w-3.5 h-3.5 mr-2" /> Remix
                      </Button>
                   </div>
                   <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-white/50 text-center">
                      Manifested by {img.user?.name || "Anonymous"} · {new Date(img.createdAt).toLocaleDateString()}
                   </p>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-16 pb-8">
              <Button 
                 onClick={() => { setPage(p => p + 1); fetchImages(page + 1) }} 
                 disabled={loading} 
                 variant="outline" 
                 className="rounded-full h-14 px-12 text-xs font-black uppercase tracking-widest border-white/10 hover:bg-white/5 group"
              >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> Load More Visions</>}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
