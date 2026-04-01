"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Check,
  Gift,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Zap,
  History as HistoryIcon,
  Plus,
  Sparkles,
  TrendingUp,
  Bookmark,
  Trash2,
  X,
  Calendar,
  Maximize2,
  ZoomOut,
  ChevronRight,
  Download,
  Share2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"
import { useCredits } from "@/hooks/use-credits"
import { showToast } from "@/lib/toast"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { credits, userData, isLoading: creditsLoading, refetch: refetchCredits } = useCredits()
  const [history, setHistory] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [zoomed, setZoomed] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimTimer, setClaimTimer] = useState<string | null>(null)

  // Reset zoom when modal changes
  useEffect(() => { setZoomed(false) }, [selected])

  // Daily claim timer logic (uses lastClaim)
  useEffect(() => {
    if (!userData?.lastClaim) return
    const interval = setInterval(() => {
      const last = new Date(userData.lastClaim).getTime()
      const next = last + 24 * 60 * 60 * 1000
      const diff = next - Date.now()
      
      if (diff <= 0) {
        setClaimTimer(null)
        clearInterval(interval)
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((diff % (1000 * 60)) / 1000)
        setClaimTimer(`${h}h ${m}m ${s}s`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [userData?.lastClaim])

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) setZoomed(false)
        else setSelected(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [zoomed, selected])

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [histResp, savedResp] = await Promise.all([
        axios.get("/api/history"),
        axios.get("/api/saved")
      ])
      if (histResp.data.success) setHistory(histResp.data.history || [])
      if (savedResp.data.success) setSavedPosts(savedResp.data.savedPosts || [])
    } catch (error) {
      console.error("DASHBOARD_FETCH_ERROR:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOne = async (id: string) => {
    try {
      await axios.delete("/api/history", { data: { id } })
      setHistory(prev => prev.filter(h => h.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      console.error("DELETE_ONE_ERR:", err)
    }
  }

  const handleDownload = (item: any) => {
    const link = document.createElement("a")
    link.href = item.imageUrl
    link.download = `manifestation-${item.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (item: any) => {
    const textToCopy = item.imageUrl?.startsWith("http") ? item.imageUrl : window.location.origin
    try {
      if (navigator.share && item.imageUrl?.startsWith("http")) {
        await navigator.share({ title: "ASTRAL AI Manifestation", text: item.prompt, url: item.imageUrl })
        return
      }
      await navigator.clipboard.writeText(textToCopy)
    } catch {
      const el = document.createElement("textarea")
      el.value = textToCopy
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUnsave = async (postId: string) => {
    try {
      await axios.post(`/api/posts/${postId}/save`)
      setSavedPosts(prev => prev.filter(p => p.postId !== postId))
    } catch (err) {
       console.error("UNSAVE_ERR:", err)
    }
  }

  const handleClaimDaily = async () => {
    if (isClaiming || claimTimer) return
    setIsClaiming(true)
    try {
      const resp = await axios.post("/api/user/claim-daily")
      if (resp.data.success) {
        showToast(`Reward claimed! +${resp.data.creditsAwarded} credit added.`, "success")
        await refetchCredits()
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to claim reward", "error")
    } finally {
      setIsClaiming(false)
    }
  }

  const handleCopyReferral = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const refLink = `${baseUrl}/register?ref=${session?.user?.id || ""}`
    navigator.clipboard.writeText(refLink)
    showToast("Referral link copied to clipboard!", "success")
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Aura...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

      {/* IMAGE DETAIL MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
            onClick={() => { if (zoomed) setZoomed(false); else setSelected(null) }}
          >
            <AnimatePresence mode="wait">
              {zoomed ? (
                <motion.div key="zoom"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="relative flex items-center justify-center w-full h-full px-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => setZoomed(false)}
                    className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all">
                    <ZoomOut className="w-4 h-4 text-white/70" />
                  </button>
                  <img src={selected.imageUrl} alt={selected.prompt}
                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-xl shadow-2xl" />
                  {/* Bottom-center action bar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md" style={{ background: "rgba(15,22,35,0.85)" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(selected) }}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(selected) }}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copiedId === selected?.id ? 'text-emerald-400' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                    >
                      {copiedId === selected?.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      {copiedId === selected?.id ? "Copied!" : "Share"}
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteOne(selected.id); setSelected(null) }}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="detail"
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="relative w-full mx-4 md:mx-0"
                  style={{ maxWidth: "600px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/[0.07]" style={{ background: "#0f1623" }}>
                    <div className="relative group">
                      <img src={selected.imageUrl} alt={selected.prompt}
                        className="w-full object-cover" style={{ maxHeight: "340px", objectFit: "cover", display: "block" }} />
                      <button onClick={() => setSelected(null)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all">
                        <X className="w-4 h-4 text-white/80" />
                      </button>
                      <button onClick={() => setZoomed(true)}
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <Maximize2 className="w-4 h-4 text-white/80" />
                      </button>
                    </div>
                    <div className="px-7 py-6 space-y-5">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Prompt</p>
                        <p className="text-sm text-white/85 leading-relaxed font-medium">{selected.prompt}</p>
                      </div>
                      <div className="h-px bg-white/[0.06]" />
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-white/25" />
                        <div>
                          <p className="text-[11px] text-white/50 font-medium">{new Date(selected.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                          <p className="text-[10px] text-white/30 font-medium">{new Date(selected.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 1. WELCOME HERO */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Manifested Resident</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Welcome back, <span className="text-primary">{session.user?.name || "Creator"}</span></h1>
        </div>
        <div className="flex gap-4">
           <Link href="/generate">
              <Button variant="premium" className="rounded-xl px-8 h-12 gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                New Manifestation <Plus className="w-4 h-4" />
              </Button>
           </Link>
        </div>
      </div>

      {/* 2. CREDITS & STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Credits Card */}
        <Card className="md:col-span-2 p-8 rounded-[2.5rem] border-primary/20 bg-primary/5 backdrop-blur-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Coins className="w-32 h-32 text-primary" />
           </div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                    <Zap className="w-5 h-5" />
                 </div>
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Available Credits</p>
              </div>
              <div className="flex items-end gap-3">
                 <h3 className="text-6xl font-black tracking-tighter text-white">
                    {creditsLoading ? "..." : credits ?? 0}
                 </h3>
                 <p className="text-sm font-bold text-muted-foreground mb-2 italic">Aura Energy Units</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                 <Link href="/pricing">
                    <Button variant="premium" className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest">
                       Get More Credits
                    </Button>
                 </Link>
                 <Button onClick={handleClaimDaily} disabled={!!claimTimer || isClaiming} variant="outline" className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/10">
                    {isClaiming ? "Claiming..." : claimTimer ? `Next Claim: ${claimTimer}` : "Claim Daily +1"}
                 </Button>
              </div>
           </div>
        </Card>

        {/* Small Stats */}
        <div className="grid grid-cols-1 gap-6">
           <Card className="p-8 rounded-[2.5rem] border-border/50 bg-card/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                   <HistoryIcon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Manifestations</p>
                <h3 className="text-3xl font-black mt-1">{history.length}</h3>
              </div>
              <Link href="/dashboard/history/credits" className="text-[9px] font-black uppercase tracking-widest text-primary mt-4 flex items-center gap-1">
                 View History <ChevronRight className="w-3 h-3" />
              </Link>
           </Card>
           <Card className="p-8 rounded-[2.5rem] border-border/50 bg-card/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                   <Bookmark className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Saved Insights</p>
                <h3 className="text-3xl font-black mt-1">{savedPosts.length}</h3>
              </div>
              <Link href="/dashboard/saved" className="text-[9px] font-black uppercase tracking-widest text-primary mt-4 flex items-center gap-1">
                 Manage Saves <ChevronRight className="w-3 h-3" />
              </Link>
           </Card>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY & SAVED POSTS GRID */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* HISTORY BLOCK */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                 <HistoryIcon className="w-5 h-5 text-primary" />
                 Aura History
              </h3>
              <div className="flex gap-4 items-center">
                 <Link href="/dashboard/history/credits" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 group">
                    Show All <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                 </Link>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {isLoading ? ( [1,2,3].map(i => <div key={i} className="aspect-square bg-white/5 rounded-3xl animate-pulse" />) ) : 
               history.length > 0 ? history.slice(0, 6).map((item, idx) => (
                 <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                   className="relative aspect-square rounded-3xl overflow-hidden group border border-white/5 bg-surface shadow-xl cursor-pointer"
                   onClick={() => setSelected(item)}
                 >
                    <img src={item.imageUrl} alt="Manifestation" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                       <p className="text-[8px] text-white/60 font-black uppercase tracking-widest mb-1 truncate">{item.prompt}</p>
                    </div>
                 </motion.div>
               )) : (
                 <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-border rounded-3xl">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No spectral trace</p>
                 </div>
               )}
           </div>
        </div>

        {/* SAVED POSTS BLOCK */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                 <Bookmark className="w-5 h-5 text-blue-500" />
                 Saved Insights
              </h3>
              <Link href="/dashboard/saved" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-blue-500 flex items-center gap-1 group">
                 Show All <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
           </div>

           <div className="space-y-4">
              {isLoading ? ( [1,2].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />) ) :
               savedPosts.length > 0 ? savedPosts.slice(0, 3).map((item: any, idx) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                   <Card className="p-4 rounded-3xl border-border/50 bg-card/10 backdrop-blur-2xl flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-primary/5">
                         {item.post?.image ? (
                            <img src={item.post.image} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center"><HistoryIcon className="w-6 h-6 text-primary/20" /></div>
                         )}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <Link href={`/blog/${item.post?.slug}`} className="hover:text-primary transition-colors">
                           <h4 className="font-bold text-xs truncate uppercase tracking-tight">{item.post?.title || "Untitled Insight"}</h4>
                        </Link>
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1 italic">{item.post?.category}</p>
                      </div>
                      <Button onClick={() => handleUnsave(item.postId)} variant="ghost" size="icon" className="shrink-0 w-10 h-10 rounded-2xl text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10">
                        <Bookmark className="w-4 h-4 fill-blue-500/40" />
                      </Button>
                   </Card>
                </motion.div>
               )) : (
                 <div className="py-12 text-center opacity-30 border-2 border-dashed border-border rounded-3xl space-y-4">
                    <Bookmark className="w-8 h-8 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No saved insights yet</p>
                    <Link href="/blog">
                       <Button size="sm" variant="outline" className="rounded-xl px-6 h-10 text-[9px] font-black uppercase tracking-widest">Browse Insights</Button>
                    </Link>
                 </div>
               )}
           </div>
        </div>
      </div>

      {/* 4. EARN FREE CREDITS SECTION */}
      <div className="space-y-8 pb-12">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
               <Gift className="w-5 h-5 text-emerald-400" />
               Earn Spectral Credits
            </h3>
         </div>

         <div className="grid md:grid-cols-2 gap-8">
            {/* Invite a Friend Card */}
            <Card className="p-8 rounded-[2.5rem] border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                  <Gift className="w-24 h-24 text-emerald-400" />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Invite a Seeker</p>
                     <h4 className="text-2xl font-black">Get +5 Credits</h4>
                     <p className="text-[10px] text-muted-foreground max-w-xs uppercase font-bold tracking-widest leading-relaxed">Share your unique spectral link. Receive credits when they join the Astral plane.</p>
                  </div>
                  <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl">
                     <div className="flex-1 px-4 py-2 text-[10px] font-mono text-muted-foreground truncate">
                        {typeof window !== "undefined" ? `${window.location.origin}/register?ref=${session?.user?.id || ""}` : "Loading link..."}
                     </div>
                     <Button onClick={handleCopyReferral} variant="secondary" className="h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-emerald-500 text-white hover:bg-emerald-600">
                        <Copy className="w-3 h-3" /> Copy
                     </Button>
                  </div>
               </div>
            </Card>

            {/* Daily Login Card (Alternative View) */}
            <Card className="p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5 backdrop-blur-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 -rotate-12">
                  <Clock className="w-24 h-24 text-blue-400" />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <p className="text-xs font-black uppercase tracking-widest text-blue-400">Daily Convergence</p>
                     <h4 className="text-2xl font-black">Daily Reward</h4>
                     <p className="text-[10px] text-muted-foreground max-w-xs uppercase font-bold tracking-widest leading-relaxed">Maintain your spectral connection. Claim +1 credit every 24 hours of existence.</p>
                  </div>
                  <Button 
                    onClick={handleClaimDaily} 
                    disabled={!!claimTimer || isClaiming}
                    className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                  >
                     {isClaiming ? "Converging..." : claimTimer ? `Return in ${claimTimer}` : "Claim Now +1 Credit"}
                  </Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  )
}
