"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/common/button"
import {
  Save, Eye, EyeOff, X, Loader2, ChevronLeft,
  Globe, BarChart3, Check, AlertTriangle, Image as ImageIcon,
  LayoutPanelLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DOMPurify from "isomorphic-dompurify"

// Extract Tiptap chunk
import { TiptapEditor } from "./editor/tiptap-editor"

/* ── Types ──────────────────────────────────────────── */
export type BlogForm = {
  title: string; slug: string; content: string; excerpt: string
  image: string; ogImage: string; tags: string[]; category: string
  published: boolean; scheduledAt: string; metaTitle: string
  metaDesc: string; keywords: string[]; canonical: string
  locale?: "en" | "ar" | "fr" // Multi-language prep
}

const EMPTY: BlogForm = {
  title: "", slug: "", content: "", excerpt: "", image: "", ogImage: "",
  tags: [], category: "General", published: false, scheduledAt: "",
  metaTitle: "", metaDesc: "", keywords: [], canonical: "", locale: "en"
}

const CATEGORIES = ["General", "AI & Tech", "Product", "Tutorial", "News", "Design", "Business"]

/* ── Helpers ────────────────────────────────────────── */
const toSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

function parseWordCount(html: string) {
  if (typeof window === "undefined" || !html) return 0
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  return tmp.innerText.trim().split(/\s+/).filter(Boolean).length
}

function seoScore(form: BlogForm) {
  const issues: string[] = []
  let score = 100
  const wc = parseWordCount(form.content)
  
  if (wc < 800) { issues.push(`Content too short (${wc} words, min 800)`); score -= 15 }
  if (!form.excerpt) { issues.push("Missing excerpt"); score -= 10 }
  if (!form.metaTitle || form.metaTitle.length < 50 || form.metaTitle.length > 60) { issues.push("Meta title must be 50-60 chars"); score -= 15 }
  if (!form.metaDesc || form.metaDesc.length < 120 || form.metaDesc.length > 160) { issues.push("Meta description must be 120-160 chars"); score -= 15 }
  if (form.keywords.length === 0) { issues.push("No keywords/tags set"); score -= 10 }
  if (!form.content.includes("<h2")) { issues.push("Missing H2 headings"); score -= 10 }
  if (!form.image) { issues.push("No cover image"); score -= 10 }

  return { score: Math.max(0, score), issues, wc }
}

export default function BlogEditor({ initialData, postId }: { initialData?: Partial<BlogForm>; postId?: string }) {
  const router = useRouter()
  
  // Hydrate local draft if available for new posts
  const [form, setForm] = useState<BlogForm>(() => {
    if (typeof window !== "undefined" && !postId) {
      const saved = localStorage.getItem("astryxo_blog_draft")
      if (saved) return { ...EMPTY, ...JSON.parse(saved) }
    }
    return { ...EMPTY, ...initialData }
  })
  
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit")
  const [sidePanel, setSidePanel] = useState<"seo" | "settings" | null>("seo")
  const [isSaving, setIsSaving] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [kwInput, setKwInput] = useState("")
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const fire = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Auto Save (Debounced) ──
  useEffect(() => {
    if (!postId) {
      const timeout = setTimeout(() => {
        localStorage.setItem("astryxo_blog_draft", JSON.stringify(form))
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

  // ── Image Uploading for Editor ──
  const handleEditorImageUpload = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) { fire("Invalid image type", false); return null }
    if (file.size > 2 * 1024 * 1024) { fire("Image exceeds 2MB", false); return null }
    
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (e: any) {
      fire(e.message || "Image processing failed", false)
    }
    return null
  }

  // ── Saving ──
  const handleSave = async (publishOverride?: boolean) => {
    if (!form.title || !form.slug || !form.content) return fire("Title, slug and content required", false)
    setIsSaving(true)
    try {
      // Clean HTML natively before saving to DB
      const cleanHTML = DOMPurify.sanitize(form.content, { ADD_ATTR: ['target'] })
      const payload = { ...form, content_html: cleanHTML, content: cleanHTML, published: publishOverride ?? form.published, scheduledAt: form.scheduledAt || null }
      
      if (postId) {
        await axios.patch("/api/admin/blogs", { id: postId, ...payload })
        fire("Post updated successfully!")
      } else {
        const resp = await axios.post("/api/admin/blogs", payload)
        localStorage.removeItem("astryxo_blog_draft")
        fire("Post created securely!")
        router.push(`/admin/blogs/${resp.data.post.id}`)
      }
    } catch (e: any) { 
      fire(e.response?.data?.error || "Save failed", false) 
    } finally { setIsSaving(false) }
  }

  const seo = seoScore(form)

  return (
    <div className="flex flex-col h-screen bg-[#060b18] overflow-hidden text-white font-sans">
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl ${toast.ok ? "bg-primary text-white" : "bg-red-500 text-white"}`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="shrink-0 h-16 border-b border-white/5 bg-background px-6 flex items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${seo.score >= 80 ? "bg-primary/20 text-primary" : "bg-amber-500/10 text-amber-400"}`}>SEO Score: {seo.score}</div>
            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase text-muted-foreground">{seo.wc} words (~{Math.max(1, Math.ceil(seo.wc/200))} min read)</div>
            {!postId && <div className="px-3 py-1 border border-white/5 rounded-full text-[10px] font-black uppercase text-muted-foreground">Draft Mode</div>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-white/5 rounded-xl p-1 mr-4 border border-white/5">
            <button onClick={() => setViewMode('edit')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex gap-1.5 transition-all ${viewMode === 'edit' ? "bg-white/10 text-white shadow" : "text-muted-foreground hover:text-white"}`}>Editor</button>
            <button onClick={() => setViewMode('split')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex gap-1.5 transition-all ${viewMode === 'split' ? "bg-white/10 text-white shadow" : "text-muted-foreground hover:text-white"}`}>Split</button>
            <button onClick={() => setViewMode('preview')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex gap-1.5 transition-all ${viewMode === 'preview' ? "bg-white/10 text-white shadow" : "text-muted-foreground hover:text-white"}`}>Preview</button>
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

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Workspace Center (Editor & Preview) */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Advanced Editor Pane */}
          <div className={`flex-1 flex flex-col gap-4 transition-all duration-300 ${viewMode === "preview" ? "hidden" : "flex"}`}>
            <input 
              value={form.title} 
              onChange={e => set("title", e.target.value)} 
              placeholder="Post Title..." 
              className="text-4xl md:text-5xl font-black bg-transparent border-none outline-none text-white tracking-tighter placeholder:text-white/20 w-full"
            />
            <div className="flex-1 bg-background/50 border border-white/5 rounded-2xl overflow-hidden relative">
              <TiptapEditor 
                content={form.content} 
                onChange={(html) => set("content", html)} 
                onUploadImage={handleEditorImageUpload} 
              />
            </div>
          </div>

          {/* Clean Client HTML Preview */}
          <div className={`flex-1 border border-white/5 rounded-2xl bg-background/50 overflow-y-auto ${viewMode === "edit" ? "hidden" : "block"}`}>
            <div className="max-w-3xl mx-auto px-10 py-12">
              <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter">{form.title || "Untitled Post"}</h1>
              <div 
                className="prose prose-invert prose-lg max-w-none text-white/90"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content || "<p class='opacity-50 italic'>Nothing to preview.</p>") }}
              />
            </div>
          </div>
        </div>

        {/* ── Side Panels (SEO & Settings) ── */}
        <AnimatePresence>
          {sidePanel && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="shrink-0 z-10 hidden lg:block overflow-hidden">
              <div className="w-[340px] h-full bg-background border border-white/5 rounded-2xl overflow-y-auto p-6 space-y-8">
                
                {sidePanel === "seo" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-black text-sm uppercase flex items-center gap-2 text-primary border-b border-white/5 pb-2">Astryxo SEO Analyzer</h3>
                    
                    {seo.issues.length > 0 ? (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Action Required</p>
                        <div className="flex flex-col gap-1.5">
                          {seo.issues.map(issue => <span key={issue} className="text-[10px] text-amber-300 flex items-start gap-1"><X className="w-3 h-3 mt-0.5 shrink-0"/> {issue}</span>)}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Optimized for Google!</span>
                      </div>
                    )}

                    <div className="space-y-4 pt-2">
                       <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground flex justify-between">Meta Title <span className={form.metaTitle.length < 50 || form.metaTitle.length > 60 ? "text-amber-500" : "text-emerald-500"}>{form.metaTitle.length}/60</span></label>
                        <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} className="w-full h-10 bg-white/5 border border-white/5 rounded-xl px-3 outline-none text-xs focus:border-primary/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground flex justify-between">Meta Desc <span className={form.metaDesc.length < 120 || form.metaDesc.length > 160 ? "text-amber-500" : "text-emerald-500"}>{form.metaDesc.length}/160</span></label>
                        <textarea value={form.metaDesc} onChange={e => set("metaDesc", e.target.value)} rows={4} className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 outline-none text-xs resize-none focus:border-primary/50 text-muted-foreground" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground">SEO Target Keywords</label>
                        <input value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter" && kwInput.trim()){set("keywords", [...form.keywords, kwInput.trim()]); setKwInput("")} }} className="w-full h-10 bg-white/5 border border-white/5 rounded-xl px-3 outline-none text-xs" placeholder="Press enter to add keyword..." />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.keywords.map(k => (
                            <span key={k} onClick={() => set("keywords", form.keywords.filter(x => x!==k))} className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-400">{k} <X className="w-3 h-3"/></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {sidePanel === "settings" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-black text-sm uppercase flex items-center gap-2 text-primary border-b border-white/5 pb-2">Post Settings</h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground">Language</label>
                        <div className="flex gap-2">
                           {["en", "ar", "fr"].map(loc => (
                             <button key={loc} onClick={() => set("locale", loc)} className={`flex-1 py-1.5 text-xs font-black uppercase rounded-lg border ${form.locale === loc ? "bg-primary/20 text-primary border-primary/50" : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"}`}>{loc}</button>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground">URL Slug</label>
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/5 px-3 h-10">
                          <span className="text-[10px] text-muted-foreground">/blog/</span>
                          <input value={form.slug} onChange={e => set("slug", toSlug(e.target.value))} className="flex-1 bg-transparent text-xs font-mono outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground">Category</label>
                        <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full h-10 bg-white/5 border border-white/5 rounded-xl px-3 outline-none text-xs text-white">
                          {CATEGORIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground">Hero Image (2MB Max)</label>
                        <div className="px-1">
                          <input type="file" id="hero-upload" className="hidden" accept="image/*" onChange={async e => {
                            if (!e.target.files?.[0]) return
                            const url = await handleEditorImageUpload(e.target.files[0])
                            if (url) set("image", url)
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
