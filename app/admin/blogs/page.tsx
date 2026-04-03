"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/common/card"
import { Button } from "@/components/common/button"
import {
  FileText, Plus, Pencil, Trash2, Eye, EyeOff,
  Check, X, Loader2, BookOpen, Search, Filter,
  TrendingUp, Clock, Tag, MessageCircle, ThumbsUp, Bookmark
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import Link from "next/link"

type Blog = {
  id: string; title: string; slug: string; excerpt: string; image?: string
  category: string; tags: string[]; readTime: number; views: number
  published: boolean; createdAt: string; updatedAt: string
  metaTitle: string; metaDesc: string
  _count?: {
    comments: number
    likes: number
    savedPosts: number
  }
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const fire = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => { fetchBlogs() }, [statusFilter])

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("q", search)
      const resp = await axios.get(`/api/admin/blogs?${params}`)
      if (resp.data.success) setBlogs(resp.data.blogs)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (blog: Blog) => {
    try {
      await axios.patch("/api/admin/blogs", { id: blog.id, published: !blog.published })
      fire(blog.published ? "Moved to drafts" : "Published!")
      fetchBlogs()
    } catch { fire("Failed", false) }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/admin/blogs", { data: { id } })
      fire("Post deleted")
      setDeleteConfirm(null)
      fetchBlogs()
    } catch { fire("Delete failed", false) }
  }

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.published).length,
    drafts: blogs.filter(b => !b.published).length,
    views: blogs.reduce((acc, b) => acc + b.views, 0),
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl ${toast.ok ? "bg-emerald-500 text-white" : "bg-destructive text-white"}`}>
            {toast.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Blog <span className="text-primary">Management</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-black">
            {stats.published} published · {stats.drafts} drafts · {stats.views.toLocaleString()} total views
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/comments">
            <Button variant="outline" className="rounded-2xl px-8 h-12 gap-2 text-xs font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/10">
              Moderation Portal <MessageCircle className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/admin/blogs/new">
            <Button variant="premium" className="rounded-2xl px-8 h-12 gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: stats.total, icon: FileText },
          { label: "Published", value: stats.published, icon: Eye },
          { label: "Drafts", value: stats.drafts, icon: EyeOff },
          { label: "Total Views", value: stats.views.toLocaleString(), icon: TrendingUp },
        ].map(s => (
          <Card key={s.label} className="p-5 rounded-2xl border-border/50 bg-card/40 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <s.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..." onKeyDown={e => e.key === "Enter" && fetchBlogs()}
            className="w-full h-12 bg-card/40 border border-border rounded-2xl pl-12 pr-6 outline-none focus:border-primary/50 text-sm" />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-5 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-card/40 border border-border text-muted-foreground hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card/30 rounded-3xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-border rounded-[3rem] opacity-50 space-y-4">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
          <p className="font-black uppercase tracking-widest text-sm">No posts found</p>
          <Link href="/admin/blogs/new">
            <Button variant="premium" className="rounded-2xl px-10 h-12 font-black uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" /> Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog, idx) => (
            <motion.div key={blog.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card className="p-5 rounded-3xl border-border/50 bg-card/40 backdrop-blur-xl flex items-center gap-5 hover:border-primary/30 transition-all">
                {/* Cover thumb */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-primary/10">
                  {blog.image ? (
                    <img src={blog.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary/50" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm tracking-tight truncate">{blog.title}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${blog.published ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{blog.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{blog.views} views</span>
                    <span className="flex items-center gap-1 text-emerald-400/80"><ThumbsUp className="w-3 h-3" />{blog._count?.likes || 0}</span>
                    <span className="flex items-center gap-1 text-blue-400/80"><MessageCircle className="w-3 h-3" />{blog._count?.comments || 0}</span>
                    <span className="flex items-center gap-1 text-purple-400/80"><Bookmark className="w-3 h-3" />{blog._count?.savedPosts || 0}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  {blog.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {blog.tags.slice(0, 4).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase">{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener">
                    <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 hover:bg-primary/10"><Eye className="w-4 h-4" /></Button>
                  </a>
                  <Button onClick={() => handleToggle(blog)} variant="ghost" size="icon"
                    className={`rounded-xl w-9 h-9 ${blog.published ? "hover:bg-amber-500/10 hover:text-amber-400" : "hover:bg-emerald-500/10 hover:text-emerald-400"}`}
                    title={blog.published ? "Unpublish" : "Publish"}>
                    {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                  </Button>
                  <Link href={`/admin/blogs/${blog.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 hover:bg-blue-500/10 hover:text-blue-400"><Pencil className="w-4 h-4" /></Button>
                  </Link>
                  {deleteConfirm === blog.id ? (
                    <div className="flex gap-1">
                      <Button onClick={() => handleDelete(blog.id)} size="icon" className="rounded-xl w-9 h-9 bg-destructive text-white hover:bg-destructive/90"><Check className="w-4 h-4" /></Button>
                      <Button onClick={() => setDeleteConfirm(null)} variant="ghost" size="icon" className="rounded-xl w-9 h-9"><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <Button onClick={() => setDeleteConfirm(blog.id)} variant="ghost" size="icon" className="rounded-xl w-9 h-9 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
