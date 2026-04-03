"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/common/button"
import {
  Save, Eye, EyeOff, Upload, X, Loader2, ChevronLeft,
  Tag, Globe, BarChart3, Check, AlertTriangle, Bold, Italic, 
  List, Code, Link2, Heading1, Heading2, Heading3, 
  Quote, Image as ImageIcon, Minus, CheckSquare, Strikethrough,
  Table as TableIcon, LayoutPanelLeft, ListOrdered
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"

/* ── Types ──────────────────────────────────────────── */
type BlogForm = {
  title: string; slug: string; content: string; excerpt: string
  image: string; ogImage: string; tags: string[]; category: string
  published: boolean; scheduledAt: string; metaTitle: string
  metaDesc: string; keywords: string[]; canonical: string
}

const EMPTY: BlogForm = {
  title: "", slug: "", content: "", excerpt: "", image: "", ogImage: "",
  tags: [], category: "General", published: false, scheduledAt: "",
  metaTitle: "", metaDesc: "", keywords: [], canonical: "",
}

const CATEGORIES = ["General", "AI & Tech", "Product", "Tutorial", "News", "Design", "Business"]

/* ── Helpers ────────────────────────────────────────── */
const toSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const readTime = (s: string) => Math.max(1, Math.ceil(wordCount(s) / 200))

function seoScore(form: BlogForm) {
  const issues: string[] = []
  let score = 100
  const wc = wordCount(form.content)
  if (wc < 300) { issues.push(`Content too short (${wc} words, min 300)`); score -= 20 }
  if (!form.excerpt) { issues.push("Missing excerpt"); score -= 10 }
  if (!form.metaTitle) { issues.push("Missing meta title"); score -= 15 }
  if (!form.metaDesc) { issues.push("Missing meta description"); score -= 15 }
  if (form.keywords.length === 0) { issues.push("No keywords set"); score -= 10 }
  if (form.tags.length === 0) { issues.push("No tags added"); score -= 5 }
  if (!form.image) { issues.push("No cover image"); score -= 10 }
  return { score: Math.max(0, score), issues }
}

/* ── Custom Markdown Parser (Zero Dependency) ───────── */
const renderMarkdown = (md: string) => {
  return md
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-black mt-6 mb-2 text-white">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-black mt-8 mb-3 text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black mt-10 mb-4 text-primary">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-black mt-12 mb-5 text-white">$1</h1>')
    // Formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-white">$1</strong>')
    .replace(/_([^_]+)_/g, '<em class="italic text-white/90">$1</em>')
    .replace(/~~(.*?)~~/g, '<del class="text-muted-foreground/60">$1</del>')
    .replace(/==(.*?)==/g, '<mark class="bg-primary/20 text-primary px-1 rounded">$1</mark>')
    // Code
    .replace(/`([^`\n]+)`/g, '<code class="bg-white/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-[#09090b] border border-white/5 p-4 rounded-xl overflow-x-auto text-sm my-6 text-white/80 whitespace-pre-wrap"><code>$1</code></pre>')
    // Links & Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl max-h-[500px] object-cover my-6 shadow-xl border border-white/5" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank">$1</a>')
    // Quotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 italic text-muted-foreground bg-primary/5 rounded-r-lg my-6">$1</blockquote>')
    // Lists
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 mb-2"><input type="checkbox" disabled class="w-4 h-4 rounded border-white/20 bg-transparent" /> <span class="text-muted-foreground">$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 mb-2"><input type="checkbox" disabled checked class="w-4 h-4 rounded border-primary bg-primary text-primary" /> <span class="line-through text-muted-foreground/50">$1</span></div>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc mb-1">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal mb-1">$1</li>')
    // Divider
    .replace(/^---$/gm, '<hr class="border-white/5 my-10" />')
    // Paragraphs (Wrap orphan lines)
    .replace(/\n\n/g, '</p><p class="mb-4 leading-7 text-muted-foreground/90">')
    .replace(/^(?!<(h|l|p|u|o|d|b|i|m|\/))(.+)/gm, '<p class="mb-4 leading-7 text-muted-foreground/90">$1</p>')
}

/* ── Main Editor Component ───────────────────────────── */
export default function BlogEditor({ initialData, postId }: { initialData?: Partial<BlogForm>; postId?: string }) {
  const router = useRouter()
  // Hydrate local draft if available for new posts
  const [form, setForm] = useState<BlogForm>(() => {
    if (typeof window !== "undefined" && !postId) {
      const saved = localStorage.getItem("astral_draft")
      if (saved) return { ...EMPTY, ...JSON.parse(saved) }
    }
    return { ...EMPTY, ...initialData }
  })
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split")
  const [sidePanel, setSidePanel] = useState<"seo" | "settings" | null>("settings")
  const [isSaving, setIsSaving] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [kwInput, setKwInput] = useState("")
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fire = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Auto Save ──
  useEffect(() => {
    if (!postId) {
      const timeout = setTimeout(() => {
        localStorage.setItem("astral_draft", JSON.stringify(form))
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [form, postId])

  const set = (key: keyof BlogForm, val: any) => {
    setForm(f => ({ ...f, [key]: val }))
    if (key === "title" && !postId) {
      setForm(f => ({ ...f, title: val, slug: toSlug(val), metaTitle: val }))
    }
  }

  // ── Markdown Insertion ──
  const insertText = (before: string, after = "", defaultText = "") => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = form.content.substring(start, end) || defaultText
    const newVal = form.content.substring(0, start) + before + selected + after + form.content.substring(end)
    set("content", newVal)
    setTimeout(() => {
      el.focus(); el.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  // ── Image Uploading (Drag, Drop, Paste, Button) ──
  const uploadImageFile = async (file: File) => {
    try {
      // Insert placeholder
      const placeholder = `\n![Uploading ${file.name}...]()\n`
      const el = textareaRef.current
      const currentPos = el ? el.selectionStart : form.content.length
      const preContent = form.content.substring(0, currentPos)
      const postContent = form.content.substring(currentPos)
      set("content", preContent + placeholder + postContent)

      // Upload
      const fd = new FormData()
      fd.append("file", file)
      const resp = await axios.post("/api/upload", fd)
      
      // Replace placeholder with real URL
      if (resp.data.success) {
        const finalUrl = `\n![${file.name.split('.')[0]}](${resp.data.url})\n`
        setForm(f => ({ ...f, content: f.content.replace(placeholder, finalUrl) }))
      }
    } catch { fire("Image upload failed", false) }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of Array.from(items)) {
      if (item.type.indexOf("image") === 0) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) uploadImageFile(file)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) uploadImageFile(e.dataTransfer.files[0])
  }

  // ── Saving ──
  const handleSave = async (publishOverride?: boolean) => {
    if (!form.title || !form.slug || !form.content) return fire("Title, slug and content required", false)
    setIsSaving(true)
    try {
      const payload = { ...form, published: publishOverride ?? form.published, scheduledAt: form.scheduledAt || null }
      if (postId) {
        await axios.patch("/api/admin/blogs", { id: postId, ...payload })
        fire("Post updated!")
      } else {
        const resp = await axios.post("/api/admin/blogs", payload)
        localStorage.removeItem("astral_draft")
        fire("Post created!")
        router.push(`/admin/blogs/${resp.data.post.id}`)
      }
    } catch (e: any) { fire(e.response?.data?.error || "Save failed", false) }
    finally { setIsSaving(false) }
  }

  const seo = seoScore(form)

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      
      {/* ── Toasts ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl ${toast.ok ? "bg-emerald-500 text-white" : "bg-destructive text-white"}`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Navigation Bar ── */}
      <header className="shrink-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl px-6 flex items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase text-muted-foreground">{wordCount(form.content)} words</div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${seo.score >= 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>SEO: {seo.score}</div>
            {!postId && <div className="px-3 py-1 border border-white/5 rounded-full text-[10px] font-black uppercase text-muted-foreground">Draft Mode</div>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-white/5 rounded-xl p-1 mr-4 border border-white/5">
            {(["edit", "split", "preview"] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${viewMode === mode ? "bg-white/10 text-white shadow" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                {mode === "edit" ? <Code className="w-3.5 h-3.5" /> : mode === "split" ? <LayoutPanelLeft className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{mode}</span>
              </button>
            ))}
          </div>

          <button onClick={() => setSidePanel(sidePanel === "seo" ? null : "seo")} className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${sidePanel === "seo" ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}><BarChart3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setSidePanel(sidePanel === "settings" ? null : "settings")} className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${sidePanel === "settings" ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}><Globe className="w-3.5 h-3.5" /></button>
          
          <Button onClick={() => handleSave(false)} variant="ghost" disabled={isSaving} className="h-9 px-4 rounded-xl text-[10px] font-black uppercase ml-2 bg-white/5 hover:bg-white/10">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Draft"}
          </Button>
          <Button onClick={() => handleSave(true)} variant="premium" disabled={isSaving} className="h-9 px-5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/20 gap-2">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Publish</>}
          </Button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${viewMode === "preview" ? "hidden" : "flex"}`}>
          
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-white/5 bg-background/95 flex items-center gap-1 px-4 overflow-x-auto scroller-hide shrink-0">
            <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
              <button onClick={() => insertText("# ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
              <button onClick={() => insertText("## ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
              <button onClick={() => insertText("### ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
              <button onClick={() => insertText("**", "**", "bold text")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Bold"><Bold className="w-4 h-4" /></button>
              <button onClick={() => insertText("_", "_", "italic text")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Italic"><Italic className="w-4 h-4" /></button>
              <button onClick={() => insertText("~~", "~~", "strikethrough")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1 border-r border-white/5 pr-2 mr-1">
              <button onClick={() => insertText("- ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Bullet List"><List className="w-4 h-4" /></button>
              <button onClick={() => insertText("1. ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
              <button onClick={() => insertText("- [ ] ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Task List"><CheckSquare className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => insertText("> ", "")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Quote"><Quote className="w-4 h-4" /></button>
              <button onClick={() => insertText("`", "`", "code")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Inline Code"><Code className="w-4 h-4" /></button>
              <button onClick={() => insertText("[", "](url)", "link text")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Link"><Link2 className="w-4 h-4" /></button>
              <button onClick={() => insertText("\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Table"><TableIcon className="w-4 h-4" /></button>
              <button onClick={() => insertText("\n\n---\n\n")} className="w-8 h-8 rounded hover:bg-white/10 flex justify-center items-center text-muted-foreground hover:text-white" title="Divider"><Minus className="w-4 h-4" /></button>
              <div className="px-2">
                <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && uploadImageFile(e.target.files[0])} />
                <label htmlFor="img-upload" className="w-8 h-8 flex justify-center items-center rounded hover:bg-white/10 text-primary cursor-pointer transition-colors" title="Upload Image"><ImageIcon className="w-4 h-4" /></label>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 overflow-y-auto w-full relative group bg-background/50">
            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={e => set("content", e.target.value)}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              placeholder="Start writing your Markdown here... Drag & Drop images or Paste them directly!"
              className="w-full h-full bg-transparent p-6 outline-none resize-none font-mono text-sm leading-8 text-white/90 placeholder:text-muted-foreground/30"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Live Preview Area */}
        <div className={`flex-1 border-l border-white/5 bg-[#0a0a0a] overflow-y-auto ${viewMode === "edit" ? "hidden" : "block"}`}>
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Native Preview Header (Visual Aid) */}
            <div className="mb-10 text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white/40">{form.title || "Untitled Post"}</h1>
            </div>
            {/* Processed Markdown */}
            <div 
              className="prose prose-invert prose-lg max-w-none text-white/90"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content || "Nothing to preview.") }}
            />
          </div>
        </div>

        {/* ── Side Panel (Settings & SEO) ── */}
        <AnimatePresence>
          {sidePanel && (
            <motion.aside initial={{ width: 0 }} animate={{ width: 340 }} exit={{ width: 0 }} className="border-l border-white/5 bg-background/80 backdrop-blur-xl overflow-y-auto shrink-0 z-10">
              <div className="p-6 space-y-6 w-[340px]">
                
                 {/* Metadata Fields Section */}
                 <div className="space-y-4 mb-6">
                  <h3 className="font-black text-sm uppercase flex items-center gap-2 text-primary border-b border-white/5 pb-2">Core Metadata</h3>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">Title</label>
                    <textarea value={form.title} onChange={e => set("title", e.target.value)} rows={2} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-black outline-none focus:border-primary/50 resize-none" placeholder="Blog Title" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">URL Slug</label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/5 px-3 h-10">
                      <span className="text-[10px] text-muted-foreground">/blog/</span>
                      <input value={form.slug} onChange={e => set("slug", toSlug(e.target.value))} className="flex-1 bg-transparent text-xs font-mono outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">Excerpt</label>
                    <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={3} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 resize-none text-muted-foreground" placeholder="Short description for cards..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">Hero Image</label>
                    <div className="px-2">
                       <input type="file" id="hero-upload" className="hidden" accept="image/*" onChange={async e => {
                         if (!e.target.files?.[0]) return
                         const fd = new FormData(); fd.append("file", e.target.files[0])
                         try { const r = await axios.post("/api/upload", fd); set("image", r.data.url) } catch { fire("Failed hero upload", false) }
                       }} />
                       {form.image ? (
                         <div className="relative rounded-xl overflow-hidden h-32 border border-white/10 group">
                           <img src={form.image} alt="Hero" className="w-full h-full object-cover" />
                           <button onClick={() => set("image", "")} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"><X className="w-4 h-4 text-white" /></button>
                         </div>
                       ) : (
                         <label htmlFor="hero-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 h-32 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all">
                           <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                           <span className="text-[10px] font-black uppercase text-muted-foreground">Upload Cover</span>
                         </label>
                       )}
                    </div>
                  </div>
                </div>

                {/* SEO SubPanel */}
                {sidePanel === "seo" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-black text-sm uppercase flex items-center gap-2 text-primary border-b border-white/5 pb-2">Search Optimization</h3>
                    
                    {seo.issues.length > 0 ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Fix SEO ({seo.score}/100)</p>
                        {seo.issues.map(issue => <p key={issue} className="text-[10px] text-amber-300">{issue}</p>)}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" /> <span className="text-[10px] font-black uppercase">Perfect SEO!</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-muted-foreground">Meta Title <span className={form.metaTitle.length > 60 ? "text-red-400" : ""}>({form.metaTitle.length}/60)</span></label>
                      <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} className="w-full h-10 bg-white/5 rounded-xl px-3 outline-none text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-muted-foreground">Meta Desc <span className={form.metaDesc.length > 160 ? "text-red-400" : ""}>({form.metaDesc.length}/160)</span></label>
                      <textarea value={form.metaDesc} onChange={e => set("metaDesc", e.target.value)} rows={3} className="w-full bg-white/5 rounded-xl px-3 py-2 outline-none text-xs resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-muted-foreground">Keywords (SEO Tags)</label>
                      <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"){set("keywords", [...form.keywords, kwInput.trim()]); setKwInput("")} }} className="w-full h-10 bg-white/5 rounded-xl px-3 outline-none text-xs" placeholder="Press enter to add..." />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {form.keywords.map(k => (
                          <span key={k} onClick={() => set("keywords", form.keywords.filter(x => x!==k))} className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-400">{k} <X className="w-3 h-3"/></span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings SubPanel */}
                {sidePanel === "settings" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-black text-sm uppercase flex items-center gap-2 text-primary border-b border-white/5 pb-2">Configuration</h3>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-muted-foreground">Category</label>
                      <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full h-10 bg-white/5 rounded-xl px-3 outline-none text-xs text-white border border-white/5">
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-muted-foreground">UI Tags</label>
                      <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter"){set("tags", [...form.tags, tagInput.trim()]); setTagInput("")} }} className="w-full h-10 bg-white/5 rounded-xl px-3 outline-none text-xs" placeholder="Press enter to add..." />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {form.tags.map(tag => (
                          <span key={tag} onClick={() => set("tags", form.tags.filter(x => x!==tag))} className="px-2 py-1 bg-primary/20 text-primary rounded-md text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-400">#{tag} <X className="w-3 h-3"/></span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
