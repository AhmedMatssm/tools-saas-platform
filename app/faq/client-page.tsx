"use client"

import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { 
  Plus, Minus, Search, 
  CircleHelp as HelpCircle, 
  MessageCircle, Mail, ArrowRight, 
  ShieldCheck, CreditCard, Zap, 
  Rocket, ChevronRight, Globe, Loader2,
  CheckCircle2
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function ClientFAQPage({ initialFaqs }: { initialFaqs: any[] }) {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<any[]>(initialFaqs)
  const [search, setSearch] = useState("")
  const [activeTopic, setActiveTopic] = useState("All Topics")
  const [feedback, setFeedback] = useState<string[]>([]) // track helpful checks

  // No client-side fetching needed since we get initialFaqs from the server

  // Auto-generate topic categories based on what exists in the DB
  const dynamicCategories = ["All Topics", ...Array.from(new Set(faqs.map(f => f.category)))]

  // Filter pipeline
  const filteredFaqs = faqs.filter(faq => {
     const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase())
     const matchesTopic = activeTopic === "All Topics" || faq.category === activeTopic
     return matchesSearch && matchesTopic
  })

  // Map arbitrary icons dynamically
  const getIcon = (name: string) => {
    if (name.includes("Billing")) return CreditCard
    if (name.includes("Technical")) return Zap
    if (name.includes("Security")) return ShieldCheck
    if (name.includes("Enterprise")) return Rocket
    return HelpCircle
  }

  const markHelpful = async (id: string, isHelpful: boolean) => {
    if (!feedback.includes(id)) {
      setFeedback([...feedback, id])
      try {
         await axios.post("/api/chat/feedback", { faqId: id, helpful: isHelpful })
      } catch (e) {}
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
       {/* 1. HERO - SEARCH HELPER */}
       <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
                <HelpCircle className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-6">Support Center</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black">How can we <br /><span className="text-blue-500 text-gradient underline decoration-blue-500/20">Support You?</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
             Everything you need to know directly from the Live Knowledge Base. 
             If you can't find your answer here, our team is always ready to jump in.
          </p>
          
          {/* SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative group pt-8">
             <Search className="absolute left-6 top-14 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search for billing, security, tutorials..." 
               className="w-full bg-surface border border-border p-6 pl-16 rounded-3xl outline-none focus:border-blue-500/50 shadow-2xl transition-all text-sm font-bold placeholder:font-normal" 
             />
             <div className="absolute right-4 top-[52px] flex gap-2">
                <span className="bg-background text-gray-500 text-[9px] font-black uppercase px-2 py-1 rounded border border-border">Ctrl</span>
                <span className="bg-background text-gray-500 text-[9px] font-black uppercase px-2 py-1 rounded border border-border">K</span>
             </div>
          </div>
       </section>

       {/* 2. FAQ ACCORDION GRID */}
       <div className="grid lg:grid-cols-5 gap-16">
          {/* CATEGORY NAV */}
          <aside className="lg:col-span-1 space-y-4 h-fit">
             <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2 mb-6">Explore Topics</h3>
             {dynamicCategories.map(cat => {
               const Icon = getIcon(cat)
               return (
                 <button 
                   key={cat} 
                   onClick={() => setActiveTopic(cat)}
                   className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:bg-surface-hover hover:text-white transition-all border ${activeTopic === cat ? "bg-blue-500/10 text-white border-blue-500/30" : "border-transparent hover:border-gray-700"} group`}
                 >
                    <Icon className={`w-4 h-4 transition-transform ${activeTopic === cat ? "text-blue-500" : "group-hover:scale-110"}`} />
                    {cat}
                    <ChevronRight className={`w-3 h-3 ml-auto transition-opacity ${activeTopic === cat ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                 </button>
               )
             })}
             
             <Card className="p-8 border-dashed border-blue-500/20 bg-blue-500/5 mt-16 space-y-4">
                <MessageCircle className="w-8 h-8 text-blue-500 animate-bounce" />
                <h4 className="font-bold">Still Need Help?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed italic pr-2">"Can't find a localized answer? Drop us a secure form via the portal."</p>
                <Button onClick={() => router.push('/contact')} variant="premium" className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl">Secure Support</Button>
             </Card>
          </aside>

          {/* QUESTIONS LIST */}
          <main className="lg:col-span-4 space-y-4">
             {filteredFaqs.length === 0 ? (
                <div className="py-20 text-center w-full text-muted-foreground text-sm font-black uppercase tracking-widest opacity-50">No database models found matching your parameters.</div>
             ) : filteredFaqs.map(faq => (
               <Card 
                 key={faq.id} 
                 className={`overflow-hidden transition-all duration-500 border-white/5 shadow-lg group ${openId === faq.id ? "bg-surface-hover ring-1 ring-blue-500/20" : "bg-surface hover:border-blue-500/30"}`}
               >
                  <button 
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full p-8 flex items-center justify-between gap-6 text-left"
                  >
                     <div className="space-y-2 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-500/60 group-hover:text-blue-500 transition-colors">{faq.category}</span>
                        <h4 className="text-xl font-bold transition-all group-hover:text-blue-400">{faq.question}</h4>
                     </div>
                     <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${openId === faq.id ? "bg-blue-600 text-white rotate-180" : "bg-surface-hover text-muted-foreground group-hover:text-white group-hover:bg-blue-600"}`}>
                        {openId === faq.id ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                     </div>
                  </button>
                  <AnimatePresence>
                    {openId === faq.id && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.3, ease: "easeInOut" }}
                       >
                         <div className="p-8 pt-0 border-t border-border/30 mt-2 bg-gradient-to-b from-transparent to-black/10">
                            <p className="text-muted-foreground leading-relaxed max-w-3xl pt-8 pb-4 italic whitespace-pre-wrap">
                              {faq.answer}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/10 justify-end items-start sm:items-center">
                               <div className="flex items-center gap-4 border border-border/50 py-2 px-4 rounded-xl">
                                  {feedback.includes(faq.id) ? (
                                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Feedback Tracked</span>
                                  ) : (
                                    <>
                                       <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-r border-border/50 pr-4">Was this helpful?</span>
                                       <div className="flex gap-4">
                                          <button onClick={() => markHelpful(faq.id, true)} className="text-sm grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all hover:-translate-y-1">👍</button>
                                          <button onClick={() => markHelpful(faq.id, false)} className="text-sm grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all hover:translate-y-1">👎</button>
                                       </div>
                                    </>
                                  )}
                               </div>
                            </div>
                         </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
               </Card>
             ))}
             
             {/* Bottom Contact Banner */}
             <div className="pt-24 pb-12 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-border/30 mt-12">
                <div className="space-y-3 text-center md:text-left">
                   <h3 className="text-2xl font-black">Direct <span className="text-blue-500">Channels</span></h3>
                   <p className="text-muted-foreground text-sm max-w-sm">Reach out via our more structured channels for specialized requests.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                   <div onClick={() => router.push('/contact')} className="flex items-center gap-3 group cursor-pointer hover:bg-surface-hover p-4 rounded-2xl transition-all border border-transparent hover:border-gray-700">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><Mail className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" /></div>
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Support Route</p>
                         <p className="text-xs font-bold text-white group-hover:text-blue-400">Secure Protocol</p>
                      </div>
                   </div>
                   <div onClick={() => router.push('/contact')} className="flex items-center gap-3 group cursor-pointer hover:bg-surface-hover p-4 rounded-2xl transition-all border border-transparent hover:border-gray-700">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" /></div>
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Dashboard</p>
                         <p className="text-xs font-bold text-white group-hover:text-purple-400">Admin Dispatch</p>
                      </div>
                   </div>
                </div>
             </div>
          </main>
       </div>
    </div>
  )
}
