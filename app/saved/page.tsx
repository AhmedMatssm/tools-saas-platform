"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  Bookmark, 
  Trash2, 
  Clock, 
  FileText,
  ChevronLeft
} from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import Link from "next/link"

export default function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await axios.get("/api/saved")
        if (data.success) setSavedPosts(data.savedPosts || [])
      } catch (err) {
        console.error("SAVED_PAGE_ERROR:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSaved()
  }, [])

  const handleRemove = async (postId: string) => {
    try {
      setSavedPosts(prev => prev.filter(p => p.postId !== postId))
      await axios.post(`/api/posts/${postId}/save`)
    } catch (err) {
      console.error("REMOVE_SAVED_ERROR:", err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 py-1 px-4 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">
                <Bookmark className="w-3 h-3 fill-blue-500" />
                Collection Saved
             </div>
             <h1 className="text-4xl md:text-5xl font-black">Your <span className="text-blue-500">Favorites</span></h1>
             <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic">A curated collection of your best visions.</p>
          </div>
          <Link href="/blog">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2">
              <ChevronLeft className="w-4 h-4" /> Back to Blog
            </Button>
          </Link>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="aspect-[4/5] bg-white/5 rounded-3xl animate-pulse" />
            ))
          ) : savedPosts.length > 0 ? (
            savedPosts.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                 <Card className="group overflow-hidden relative border-white/5 bg-surface hover:border-blue-500 transition-all duration-500 shadow-2xl rounded-3xl h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                       <div className="w-full h-full bg-[#070d1f] flex items-center justify-center">
                          {item.post?.image ? (
                             <img src={item.post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                             <FileText className="w-12 h-12 text-blue-500/20" />
                          )}
                       </div>
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 p-4 text-center">
                          <Link href={`/blog/${item.post?.slug}`}>
                            <Button variant="secondary" size="sm" className="rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/20 text-white font-bold uppercase tracking-widest text-[9px]">
                               View Post
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => handleRemove(item.postId)}
                            variant="ghost" 
                            size="sm" 
                            className="text-white hover:bg-red-500/20 hover:text-red-500 gap-2 text-[9px] font-black uppercase tracking-widest"
                          >
                             <Trash2 className="w-3 h-3" />
                             Remove Favorited
                          </Button>
                       </div>
                    </div>
                    <div className="p-6 space-y-4 bg-gradient-to-b from-surface/80 to-surface flex-grow">
                       <div className="space-y-2">
                          <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 truncate">{item.post?.title || "Untitled Insight"}</p>
                          <p className="text-xs font-bold text-[#859397] uppercase tracking-tighter flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Saved on {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                 </Card>
              </motion.div>
            ))
          ) : (
            <Card className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-8 border-dashed border-gray-800 bg-transparent">
               <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center border-2 border-dashed border-gray-700">
                  <Heart className="w-12 h-12 text-gray-700" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black">Your collection is empty</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto italic font-medium leading-relaxed pr-2">Browse our blog and click the bookmark icon on posts you love to save them here for easy access later.</p>
                  <Link href="/blog">
                    <Button variant="premium" className="px-12 h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl">Start Exploring</Button>
                  </Link>
               </div>
            </Card>
          )}
       </div>
    </div>
  )
}
