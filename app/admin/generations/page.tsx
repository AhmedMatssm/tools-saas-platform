"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/common/input"
import { Button } from "@/components/common/button"
import { Search, ChevronLeft, ChevronRight, Loader2, Monitor, MapPin, AlignLeft, Calendar, User, Eye, Download, X, Heart } from "lucide-react"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"

export default function GenerationsExplorer() {
  const [gens, setGens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [selectedGen, setSelectedGen] = useState<any>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const toggleLove = async (e: React.MouseEvent, id: string, currentState: boolean) => {
    e.stopPropagation()
    setTogglingId(id)
    try {
      const resp = await axios.post("/api/admin/toggle-love", { generationId: id, isLoved: !currentState })
      if (resp.data.success) {
        setGens(prev => prev.map(g => g.id === id ? { ...g, isLoved: resp.data.isLoved } : g))
        if (selectedGen?.id === id) setSelectedGen({ ...selectedGen, isLoved: resp.data.isLoved })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const resp = await axios.get(`/api/admin/generations?page=${page}&limit=12&search=${encodeURIComponent(search)}`)
        if (resp.data.success) {
          setGens(resp.data.generations)
          setTotalPages(resp.data.pagination.pages)
          setTotal(resp.data.pagination.total)
        }
      } catch (error) {
         console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    // Simple debounce
    const timeout = setTimeout(() => { fetch() }, 500)
    return () => clearTimeout(timeout)
  }, [page, search])

  const handleDownload = async (url: string, id: string) => {
     try {
       const res = await fetch(url)
       const blob = await res.blob()
       const urlBlob = window.URL.createObjectURL(blob)
       const a = document.createElement("a")
       a.style.display = "none"
       a.href = urlBlob
       a.download = `manifestation_${id}.jpg`
       document.body.appendChild(a)
       a.click()
       window.URL.revokeObjectURL(urlBlob)
     } catch (e) {
       console.error("Failed to download", e)
     }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase underline decoration-primary/20 underline-offset-8">Manifestation <span className="text-primary italic">Logs</span></h1>
        <p className="text-muted-foreground text-sm font-bold opacity-80 uppercase tracking-widest flex items-center gap-2"><Monitor className="w-4 h-4" /> Tracking {total} Total Generations</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
        <div className="relative w-full max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input 
             placeholder="Search prompts..." 
             className="pl-10 h-10 w-full bg-card/40 border-white/10 rounded-xl"
             value={search}
             onChange={(e) => { setSearch(e.target.value); setPage(1) }}
           />
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-10 px-4 gap-2 rounded-xl bg-white/5 hover:bg-white/10"><ChevronLeft className="w-4 h-4" /> Prev</Button>
          <span className="font-mono text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-10 px-4 gap-2 rounded-xl bg-white/5 hover:bg-white/10">Next <ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Data Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : gens.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
           <Search className="w-12 h-12" />
           <p className="font-black uppercase tracking-widest text-sm">No records found matching query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gens.map(gen => (
            <motion.div 
               key={gen.id} 
               layoutId={`card-${gen.id}`}
               className="group relative bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 shadow-xl hover:border-primary/30 transition-all cursor-pointer flex flex-col h-full"
               onClick={() => setSelectedGen(gen)}
            >
               <div className="w-full h-48 overflow-hidden bg-black flex-shrink-0 relative">
                 <img src={gen.imageUrl} alt={gen.prompt} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                 <div className={`absolute top-4 right-4 z-10 transition-all duration-300 ${gen.isLoved ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                   <button 
                     onClick={(e) => toggleLove(e, gen.id, !!gen.isLoved)}
                     disabled={togglingId === gen.id}
                     className={`p-2.5 rounded-full backdrop-blur-xl border transition-all active:scale-95 ${
                       gen.isLoved 
                         ? "bg-red-500/20 border-red-500/40 text-red-500" 
                         : "bg-black/40 border-white/10 text-white/50 hover:text-white"
                     }`}
                   >
                     {togglingId === gen.id ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <Heart className={`w-4 h-4 ${gen.isLoved ? "fill-current" : ""}`} />
                     )}
                   </button>
                 </div>
               </div>
               
               <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                     <p className="text-sm font-black line-clamp-3 leading-relaxed tracking-tight">{gen.prompt}</p>
                     <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-primary/20 flex justify-center items-center text-[8px] font-black text-primary border border-primary/30"><User className="w-3 h-3" /></div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{gen.user?.email || "Anonymous Local"}</p>
                     </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {gen.ip || "Unknown"}</span>
                    <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedGen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGen(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl p-6 bg-background/95 border border-white/10 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-y-auto"
            >
               <button onClick={() => setSelectedGen(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"><X className="w-5 h-5 text-white" /></button>
               
               <div className="w-full md:w-1/2 bg-black rounded-[2rem] overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl relative group">
                  <img src={selectedGen.imageUrl} alt={selectedGen.prompt} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                     <Button onClick={() => handleDownload(selectedGen.imageUrl, selectedGen.id)} className="w-full rounded-xl gap-2 font-black uppercase tracking-widest"><Download className="w-4 h-4" /> Download Raw</Button>
                  </div>
               </div>

               <div className="w-full md:w-1/2 space-y-8 flex flex-col justify-center">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-3"><AlignLeft className="w-3 h-3" /> Original Prompt</h3>
                    <p className="text-xl font-black leading-relaxed text-white/90">{selectedGen.prompt}</p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> Created</span>
                       <span className="text-sm font-mono text-white/90">{new Date(selectedGen.createdAt).toLocaleString()}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2"><MapPin className="w-3 h-3" /> Origination IP</span>
                       <span className="text-sm font-mono text-white/90">{selectedGen.ip || "Unknown"}</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-2"><User className="w-3 h-3" /> Linkage</span>
                       <div className="text-right">
                         <span className="text-sm font-bold block">{selectedGen.user?.name || "Local Instance"}</span>
                         {selectedGen.user?.email && <span className="text-[10px] uppercase tracking-widest text-primary font-mono block">{selectedGen.user.email}</span>}
                       </div>
                     </div>
                  </div>

                  <div className="pt-8">
                     <Button variant="outline" className="w-full rounded-xl font-black uppercase tracking-widest text-xs h-12 border-white/10 hover:bg-white/5" asChild>
                       <a href={selectedGen.imageUrl} target="_blank" rel="noopener noreferrer"><Eye className="w-4 h-4 mr-2" /> Open Native Resolution</a>
                     </Button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
