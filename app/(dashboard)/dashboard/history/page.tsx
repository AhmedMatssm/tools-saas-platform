"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/common/button"
import { Search, Trash2, Download, Share2, Trash, AlertCircle, X, Calendar, Maximize2, ZoomOut, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"

type HistoryItem = {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REUSABLE IMAGE DETAIL MODAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ImageModal({
  item,
  onClose,
  onDownload,
  onShare,
  onDelete,
}: {
  item: HistoryItem
  onClose: () => void
  onDownload: (item: HistoryItem) => void
  onShare: (item: HistoryItem) => void
  onDelete: (id: string) => void
}) {
  const [zoomed, setZoomed] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (zoomed) setZoomed(false)
      else onClose()
    }
  }, [zoomed, onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
  const formattedTime = new Date(item.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
      onClick={() => { if (zoomed) setZoomed(false); else onClose() }}
    >
      <AnimatePresence mode="wait">

        {/* ── ZOOM VIEW: image only, distraction-free ── */}
        {zoomed ? (
          <motion.div
            key="zoom"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative flex items-center justify-center w-full h-full px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top-right: collapse zoom */}
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all group"
              title="Exit zoom (Esc)"
            >
              <ZoomOut className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
            </button>

            <img
              src={item.imageUrl}
              alt={item.prompt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              style={{ display: "block", margin: "auto" }}
            />

            {/* Bottom-center: action bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md" style={{ background: "rgba(15,22,35,0.85)" }}>
              <button
                onClick={(e) => { e.stopPropagation(); onDownload(item) }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button
                onClick={(e) => { e.stopPropagation(); onShare(item) }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); onClose() }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </motion.div>

        ) : (

          /* ── DEFAULT DETAIL VIEW ── */
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full mx-4 md:mx-0"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/[0.07]" style={{ background: "#0f1623" }}>

              {/* ── IMAGE SECTION ── */}
              <div className="relative group">
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="w-full object-cover"
                  style={{ maxHeight: "340px", objectFit: "cover", display: "block" }}
                />

                {/* Top-right: Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>

                {/* Bottom-right: Zoom / Expand button (visible on hover) */}
                <button
                  onClick={() => setZoomed(true)}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Expand image"
                >
                  <Maximize2 className="w-4 h-4 text-white/80" />
                </button>
              </div>

              {/* ── METADATA SECTION ── */}
              <div className="px-7 py-6 space-y-5">

                {/* Prompt label */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Prompt</p>
                  <p className="text-sm text-white/85 leading-relaxed font-medium">{item.prompt}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* Date */}
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-white/25" />
                  <div>
                    <p className="text-[11px] text-white/50 font-medium">{formattedDate}</p>
                    <p className="text-[10px] text-white/30 font-medium">{formattedTime}</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [selected, setSelected] = useState<HistoryItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    try {
      const resp = await axios.get("/api/history")
      if (resp.data.success) setHistory(resp.data.history)
    } finally { setIsLoading(false) }
  }

  const handleDeleteOne = async (id: string) => {
    try {
      await axios.delete("/api/history", { data: { id } })
      setHistory(prev => prev.filter(item => item.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) { console.error(err) }
  }

  const handleClearAll = async () => {
    setIsClearing(true)
    try {
      await axios.delete("/api/history", { data: { deleteAll: true } })
      setHistory([])
      setShowClearConfirm(false)
      setSelected(null)
    } finally { setIsClearing(false) }
  }

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement("a")
    link.href = item.imageUrl
    link.download = `manifestation-${item.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (item: HistoryItem) => {
    const urlToCopy = window.location.origin + "/blog" // fallback if imageUrl is not a public URL
    const textToCopy = item.imageUrl?.startsWith("http") ? item.imageUrl : urlToCopy
    try {
      // Try native share API (mobile / HTTPS)
      if (navigator.share && item.imageUrl?.startsWith("http")) {
        await navigator.share({ title: "ASTRAL AI Manifestation", text: item.prompt, url: item.imageUrl })
        return
      }
      // Clipboard API (modern browsers)
      await navigator.clipboard.writeText(textToCopy)
    } catch {
      // Fallback for older browsers
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
    // Visual feedback
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredHistory = history.filter(item =>
    item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selected && <ImageModal
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDeleteOne}
        />}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black">My <span className="text-emerald-400">Manifestations</span></h2>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-black">The spectral history of your AI creations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search manifests..."
              className="w-full h-12 bg-card/40 border border-border rounded-xl pl-12 pr-6 outline-none focus:border-emerald-500/50 text-xs" />
          </div>
          {history.length > 0 && (
            <Button onClick={() => setShowClearConfirm(true)} variant="outline"
              className="h-12 px-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 text-[10px] font-black uppercase tracking-widest">
              Clear All <Trash className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* ── CLEAR CONFIRM ── */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-8 rounded-3xl bg-destructive/10 border border-destructive/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-destructive shrink-0" />
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-destructive">Wipe Spectral Records?</h4>
                <p className="text-xs text-muted-foreground mt-1">This action is irreversible. All generated manifestations will be erased from the network.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button onClick={handleClearAll} disabled={isClearing}
                className="bg-destructive text-white hover:bg-destructive/90 rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest">
                {isClearing ? "Erasing..." : "Yes, Purge History"}
              </Button>
              <Button onClick={() => setShowClearConfirm(false)} variant="outline"
                className="rounded-xl px-8 h-12 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GRID ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-card/40 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-40 text-center border-2 border-dashed border-border rounded-[3rem] opacity-30">
          <p className="text-[10px] font-black uppercase tracking-widest mt-4">No spectral traces found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredHistory.map((item, idx) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="group relative rounded-3xl overflow-hidden aspect-square border border-border hover:border-emerald-500/40 transition-all shadow-2xl cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-5 backdrop-blur-[2px]">
                {/* Action buttons top-right */}
                <div className="flex justify-end gap-2 translate-y-[-8px] group-hover:translate-y-0 transition-transform">
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(item) }}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white flex items-center justify-center transition-all group/btn">
                    <Download className="w-3.5 h-3.5 text-white group-hover/btn:text-black" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleShare(item) }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group/btn ${copiedId === item.id ? 'bg-emerald-500' : 'bg-white/10 hover:bg-white'}`}>
                    {copiedId === item.id
                      ? <Check className="w-3.5 h-3.5 text-white" />
                      : <Share2 className="w-3.5 h-3.5 text-white group-hover/btn:text-black" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteOne(item.id) }}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white flex items-center justify-center transition-all group/btn">
                    <Trash2 className="w-3.5 h-3.5 text-white group-hover/btn:text-black" />
                  </button>
                </div>
                {/* Prompt snippet bottom */}
                <p className="text-[9px] font-semibold text-white/70 italic line-clamp-2 leading-relaxed">"{item.prompt}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
