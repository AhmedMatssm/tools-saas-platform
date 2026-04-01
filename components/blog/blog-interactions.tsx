"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ThumbsUp, Share2, ArrowRight, CornerDownRight, Bookmark, User } from "lucide-react"
import { showToast } from "@/lib/toast"

export default function BlogInteractions({ postId }: { postId: string }) {
  const { data: session } = useSession()
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [hasSaved, setHasSaved] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    // Fetch likes
    fetch(`/api/posts/${postId}/like`)
      .then(res => res.json())
      .then(data => {
        setLikes(data.count || 0)
        setHasLiked(data.hasLiked || false)
      })
      .catch(console.error)

    // Fetch save state
    fetch(`/api/posts/${postId}/save`)
      .then(res => res.json())
      .then(data => setHasSaved(data.hasSaved || false))
      .catch(console.error)

    // Fetch comments
    fetch(`/api/posts/${postId}/comments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComments(data)
      })
      .catch(console.error)
  }, [postId])

  const handleLike = async () => {
    if (!session) return showToast("Please sign in to like this post.", "error")
    // Optimistic update
    setHasLiked(!hasLiked)
    setLikes(prev => hasLiked ? prev - 1 : prev + 1)
    
    await fetch(`/api/posts/${postId}/like`, { method: "POST" })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast("Link copied to clipboard!", "success")
    }
  }

  const handleSave = async () => {
    if (!session) return showToast("Please sign in to save this post.", "error")
    setHasSaved(!hasSaved)
    await fetch(`/api/posts/${postId}/save`, { method: "POST" })
  }

  const submitReply = async (parentId: string) => {
    if (!session) return showToast("Please sign in to reply.", "error")
    if (!replyContent.trim()) return

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: replyContent, parentId })
    })

    if (res.ok) {
      const data = await res.json()
      showToast(data.comment.status === "APPROVED" ? "Reply added!" : "Reply submitted for moderation.", data.comment.status === "APPROVED" ? "success" : "info")
      setReplyContent("")
      setReplyingTo(null)
      fetch(`/api/posts/${postId}/comments`)
        .then(r => r.json())
        .then(d => setComments(Array.isArray(d) ? d : []))
    }
  }

  const submitComment = async () => {
    if (!session) return showToast("Please sign in to comment.", "error")
    if (!newComment.trim()) return

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: newComment })
    })

    if (res.ok) {
      const data = await res.json()
      showToast(data.comment.status === "APPROVED" ? "Comment added!" : "Comment submitted for moderation.", data.comment.status === "APPROVED" ? "success" : "info")
      setNewComment("")
      if (data.comment.status === "APPROVED") {
        setComments([{ ...data.comment, user: { name: session.user?.name } }, ...comments])
      }
    }
  }

  return (
    <div className="mt-16 text-[#dce1fb]">

      {/* Post Footer */}
      <div className="flex items-center justify-between py-10 border-t border-white/5">
        <div className="flex gap-4">
          <button onClick={handleLike} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e3447]/60 hover:bg-[#33394c]/80 transition-all text-sm font-bold">
            <ThumbsUp className={`w-5 h-5 ${hasLiked ? "text-[#8aebff] fill-[#8aebff]" : "text-[#8aebff]"}`} /> {likes > 0 ? likes : "Like"}
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e3447]/60 hover:bg-[#33394c]/80 transition-all text-sm font-bold">
            <Bookmark className={`w-5 h-5 ${hasSaved ? "text-[#d0bcff] fill-[#d0bcff]" : "text-[#bbc9cd]"}`} /> {hasSaved ? "Saved" : "Save"}
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2e3447]/60 hover:bg-[#33394c]/80 transition-all text-sm font-bold">
            <Share2 className="w-5 h-5 text-[#bbc9cd]" /> Share
          </button>
        </div>
        <div className="flex items-center gap-4 group cursor-pointer">
          <span className="text-[#859397] text-xs uppercase tracking-widest font-bold group-hover:text-[#8aebff] transition-colors">Next Post</span>
          <ArrowRight className="w-5 h-5 text-[#8aebff] group-hover:translate-x-2 transition-transform" />
        </div>
      </div>

      {/* Threaded Comments Section */}
      <section className="space-y-10 mt-16">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-[#dce1fb]">Neural Discussions</h3>
          <div className="h-px flex-grow bg-white/5"></div>
          <span className="text-xs font-mono text-[#859397] uppercase tracking-widest">{comments.length} Nodes Connected</span>
        </div>

        {/* Comment Input */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2e3447] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <User className="w-5 h-5 text-[#859397]" />
            </div>
            <div className="flex-grow space-y-4">
              <textarea 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full bg-[#070d1f]/50 border border-white/5 rounded-xl p-4 text-sm text-[#dce1fb] placeholder:text-[#859397]/50 input-focus-glow transition-all resize-none h-24" 
                placeholder="Broadcast your thoughts to the void..."
              ></textarea>
              <div className="flex justify-end items-center">
                <button onClick={submitComment} className="bg-gradient-to-r from-[#8aebff]/80 to-[#8aebff] text-[#00363e] font-bold px-6 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm">
                  Deploy Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Thread */}
        <div className="space-y-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-6 group">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-[#8aebff]/20 p-0.5 shrink-0 flex items-center justify-center bg-[#2e3447]">
                  <b className="text-[#8aebff]">{comment.user?.name?.[0]?.toUpperCase() || "U"}</b>
                </div>
                {comment.replies?.length > 0 && <div className="w-px h-full bg-white/5 group-hover:bg-[#8aebff]/20 transition-colors"></div>}
              </div>
              <div className="flex-grow space-y-3 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#dce1fb]">{comment.user?.name || "Anonymous"}</span>
                  {comment.user?.role === "ADMIN" && <span className="text-[10px] font-mono text-[#8aebff] bg-[#8aebff]/10 px-2 py-0.5 rounded">MODERATOR</span>}
                  <span className="text-xs text-[#859397]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[#bbc9cd] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                <div className="flex gap-4">
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-xs font-bold text-[#859397] hover:text-[#8aebff] transition-colors flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" /> Reply
                  </button>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-4 flex gap-4 pl-4 border-l-2 border-[#8aebff]/20">
                    <textarea 
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      className="w-full bg-[#070d1f]/30 border border-white/5 rounded-xl p-3 text-sm text-[#dce1fb] placeholder:text-[#859397]/50 input-focus-glow transition-all resize-none h-16" 
                      placeholder="Type your reply..."
                    ></textarea>
                    <button onClick={() => submitReply(comment.id)} className="bg-[#8aebff]/20 text-[#8aebff] hover:bg-[#8aebff]/30 font-bold px-4 py-2 rounded-lg transition-all text-xs h-16 shrink-0">
                      Submit
                    </button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies?.map((reply: any) => (
                  <div key={reply.id} className="mt-6 flex gap-6 pl-2">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-[#d0bcff]/20 p-0.5 shrink-0 flex items-center justify-center bg-[#23293c]">
                         <b className="text-[#d0bcff]">{reply.user?.name?.[0]?.toUpperCase() || "U"}</b>
                      </div>
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#dce1fb]">{reply.user?.name || "Anonymous"}</span>
                        {reply.user?.role === "ADMIN" && <span className="text-[10px] font-mono text-[#d0bcff] bg-[#d0bcff]/10 px-2 py-0.5 rounded">MODERATOR</span>}
                        <span className="text-xs text-[#859397]">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#bbc9cd] text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
