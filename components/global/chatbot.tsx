"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Shield, Loader2, Info, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import axios from "axios"

type ChatMessage = { role: "system" | "user", content: string, logId?: string, rated?: boolean, isMiss?: boolean }

export function Chatbot() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
     { role: "system", content: "Welcome to Secure Chat. This AI agent leverages our rigid internal Knowledge Base to answer your queries contextually. How can I assist you today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return
    if (input.length > 500) {
      setMessages(prev => [...prev, { role: "system", content: "⚠️ Security exception: Message exceeds 500 characters. Please shorten your input." }])
      return
    }

    const query = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: query }])
    
    setLoading(true)
    try {
      const resp = await axios.post("/api/chat", { message: query })
      setMessages(prev => [...prev, { 
         role: "system", 
         content: resp.data.reply, 
         logId: resp.data.logId,
         isMiss: resp.data.isMiss 
      }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "system", content: err.response?.data?.error || "Platform Firewall triggered." }])
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (index: number, logId: string, helpful: boolean) => {
    // Optimistic UI updates
    const updated = [...messages]
    updated[index].rated = true
    setMessages(updated)

    try { await axios.post("/api/chat/feedback", { logId, helpful }) } catch (e) {}
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {open && (
           <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
             className="w-80 md:w-96 h-[500px] mb-4 bg-background/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
           >
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-primary/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white">AI Support Node</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary">Connected & Encrypted</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></Button>
              </div>

              {/* Chat Window */}
              <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-4 scrollbar-thin">
                 {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                       <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap
                         ${m.role === "user" 
                           ? "max-w-[85%] bg-primary text-primary-foreground rounded-br-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                           : "max-w-[95%] bg-white/5 border border-white/10 rounded-bl-sm"}
                       `}>
                          {m.content}
                       </div>
                       
                       {/* AI Metadata Rendering (Feedback loops & Missing Logs) */}
                       {m.role === "system" && m.logId && (
                          <div className="mt-2 pl-2">
                             {m.isMiss ? (
                                <Button onClick={() => router.push('/contact')} variant="outline" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-amber-500 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20">
                                   Connect to Human Agent <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                             ) : m.rated ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Feedback Logged</span>
                             ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Was this helpful?</span>
                                  <button onClick={() => handleRate(i, m.logId!, true)} className="text-xs hover:-translate-y-1 transition-transform grayscale opacity-50 hover:grayscale-0 hover:opacity-100">👍</button>
                                  <button onClick={() => handleRate(i, m.logId!, false)} className="text-xs hover:translate-y-1 transition-transform grayscale opacity-50 hover:grayscale-0 hover:opacity-100">👎</button>
                                </div>
                             )}
                          </div>
                       )}
                    </div>
                 ))}
                 
                 {loading && (
                    <div className="flex justify-start">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-sm flex items-center gap-2">
                           <Loader2 className="w-4 h-4 animate-spin text-primary" />
                           <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Vector Mapping DB Context...</span>
                       </div>
                    </div>
                 )}
                 <div ref={endRef} />
              </div>

              {/* Input Area */}
              <div className="absolute bottom-0 w-full p-4 bg-background border-t border-white/5">
                 <form onSubmit={handleSend} className="relative flex items-center">
                    <Input 
                      value={input} 
                      onChange={e => setInput(e.target.value)}
                      placeholder="Input support query..." 
                      className="pr-12 bg-white/5 border-white/10 rounded-xl h-12 text-xs" 
                    />
                    <Button disabled={loading || !input.trim()} type="submit" size="icon" className="absolute right-1 w-10 h-10 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors bg-transparent text-white">
                       <Send className="w-4 h-4" />
                    </Button>
                 </form>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
      
      {!open && (
         <Button onClick={() => setOpen(true)} className="h-16 w-16 rounded-[2rem] bg-primary text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all">
            <MessageCircle className="w-8 h-8" />
         </Button>
      )}
    </div>
  )
}
