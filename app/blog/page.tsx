"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Tag, Clock, TrendingUp, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import axios from "axios"

type Blog = {
  id: string; title: string; slug: string; excerpt: string; image?: string
  category: string; tags: string[]; readTime: number; views: number; createdAt: string
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "9" })
      if (search) params.set("q", search)
      if (activeCategory) params.set("category", activeCategory)
      const resp = await axios.get(`/api/blog?${params}`)
      if (resp.data.success) {
        setBlogs(resp.data.blogs)
        setCategories(resp.data.categories || [])
        setTotalPages(resp.data.pages)
        setTotal(resp.data.total)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchBlogs() }, [page, activeCategory])
  useEffect(() => { if (page === 1) fetchBlogs(); else setPage(1) }, [search])

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">

      {/* Header */}
      <div className="text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">Intelligence Journal</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
          Manifest <span className="text-primary italic">Insights</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">{total} articles exploring AI, creativity, and the future of creation.</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-5">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchBlogs()}
            placeholder="Search articles..."
            className="w-full h-14 bg-card/40 border border-border rounded-2xl pl-14 pr-6 outline-none focus:border-primary/50 text-sm backdrop-blur transition-all" />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => { setActiveCategory(""); setPage(1) }}
              className={`px-5 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!activeCategory ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:text-white border border-white/10"}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setPage(1) }}
                className={`px-5 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:text-white border border-white/10"}`}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-[480px] bg-card/30 rounded-[3rem] animate-pulse" />)}
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-border rounded-[3rem] opacity-50 space-y-4">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
          <p className="font-black uppercase tracking-widest">No articles found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <motion.div key={blog.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}>
              <Link href={`/blog/${blog.slug}`}>
                <Card className="h-full group rounded-[3rem] overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/40 transition-all shadow-2xl hover:-translate-y-2 flex flex-col cursor-pointer">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-primary/5">
                    {blog.image ? (
                      <img src={blog.image} alt={blog.title} loading="lazy"
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 space-y-5 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.readTime} min</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {blog.views}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <h2 className="text-xl font-black tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{blog.excerpt}</p>
                      )}
                    </div>

                    {blog.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {blog.tags.slice(0, 3).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                      Read Article <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline"
            className="rounded-xl h-12 w-12 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${p === page ? "bg-primary text-white" : "bg-card/40 border border-border text-muted-foreground hover:text-white"}`}>
              {p}
            </button>
          ))}
          <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline"
            className="rounded-xl h-12 w-12 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
