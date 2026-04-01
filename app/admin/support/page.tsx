"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Plus, Loader2, Save, Trash, CheckCircle2, MessageSquare, AlertTriangle, MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { showToast } from "@/lib/toast"

export default function AdminSupportDashboard() {
  const [data, setData] = useState<{ faqs: any[], questions: any[], docs: any[] }>({ faqs: [], questions: [], docs: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"faqs" | "questions" | "docs">("questions")

  const [editFaq, setEditFaq] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchAuthData = async () => {
    setLoading(true)
    try {
      const resp = await axios.get("/api/admin/support")
      if (resp.data.success) {
        setData({ faqs: resp.data.faqs, questions: resp.data.questions, docs: resp.data.docs || [] })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAuthData() }, [])

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.post("/api/admin/support", { action: "UPSERT_FAQ", payload: editFaq })
      setEditFaq(null)
      fetchAuthData()
    } catch (e: any) {
      console.error("SAVE_FAQ_ERR:", e)
      showToast(e.response?.data?.message || "Failed to save. Please try again.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFaq = async (id: string, isDoc = false) => {
    const label = isDoc ? 'Support Document' : 'FAQ'
    if (!window.confirm(`Delete this ${label}? This cannot be undone.`)) return
    try {
      await axios.post("/api/admin/support", { action: isDoc ? "DELETE_DOC" : "DELETE_FAQ", payload: { id } })
      fetchAuthData()
    } catch (e) {}
  }

  const handleResolve = async (id: string) => {
    try {
      await axios.post("/api/admin/support", { action: "RESOLVE_QUESTION", payload: { id } })
      fetchAuthData()
    } catch (e) {}
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase underline decoration-primary/20 underline-offset-8">
            Sentinel <span className="text-primary italic">Support</span>
          </h1>
          <p className="text-muted-foreground text-sm font-bold opacity-80 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" /> Admin Console · Knowledge Base Routing
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
           <Button onClick={() => setActiveTab("questions")} variant={activeTab === "questions" ? "premium" : "outline"} className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest border-white/10"><MessageCircle className="w-4 h-4" /> Reports</Button>
           <Button onClick={() => setActiveTab("faqs")} variant={activeTab === "faqs" ? "premium" : "outline"} className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest border-white/10"><Shield className="w-4 h-4" /> FAQs</Button>
           <Button onClick={() => setActiveTab("docs")} variant={activeTab === "docs" ? "premium" : "outline"} className="rounded-xl px-6 h-12 gap-2 text-xs font-black uppercase tracking-widest border-white/10"><Save className="w-4 h-4" /> Support Docs</Button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : activeTab === "questions" ? (
        <div className="space-y-6">
           {data.questions.map((q) => (
              <Card key={q.id} className={`p-6 md:p-8 rounded-[2rem] border-white/5 backdrop-blur-xl transition-all shadow-2xl relative overflow-hidden group ${q.isResolved ? "bg-card/20 border-emerald-500/10" : "bg-card/60"}`}>
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare className="w-24 h-24" /></div>
                 <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
                    <div className="space-y-3 flex-1 min-w-0 pr-8">
                       <div className="flex gap-3">
                         <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${q.source === "CONTACT_FORM" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : q.source.includes("CHATBOT") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : q.source === "FAQ_FEEDBACK" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                           {q.source.replace("_", " ")}
                         </span>
                         {q.isResolved && <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>}
                         {q.helpful === true && <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">👍 Helpful</span>}
                         {q.helpful === false && <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">👎 Bad Match</span>}
                       </div>
                       <p className="text-xl font-black tracking-tight leading-relaxed text-white/90">{q.question}</p>
                       <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          {q.name && <span><span className="opacity-50">Origin:</span> {q.name} ({q.email})</span>}
                          <span><span className="opacity-50">IP Trigger:</span> {q.ip || "Secure"}</span>
                          <span><span className="opacity-50">Time:</span> {new Date(q.createdAt).toLocaleString()}</span>
                       </div>
                    </div>
                    {!q.isResolved && (
                       <Button onClick={() => handleResolve(q.id)} variant="outline" className="rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 px-8 h-12 text-[10px] font-black uppercase tracking-widest shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)] gap-2"><CheckCircle2 className="w-4 h-4" /> Mark as Resolved</Button>
                    )}
                 </div>
              </Card>
           ))}
           {data.questions.length === 0 && <p className="text-center py-20 uppercase font-black tracking-widest text-muted-foreground opacity-50">No inbound routing traffic.</p>}
        </div>
      ) : activeTab === "faqs" ? (
        <div className="space-y-8">
           <Button onClick={() => setEditFaq({ question: "", answer: "", category: "General", isPublished: true })} variant="premium" className="h-14 rounded-2xl px-8 text-xs font-black uppercase tracking-widest shadow-xl flex gap-2"><Plus className="w-4 h-4" /> Inject New Local FAQ Model</Button>

           <AnimatePresence>
             {editFaq && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                   <Card className="p-8 rounded-[2rem] border-primary/30 bg-primary/5 space-y-6">
                     <form onSubmit={handleSaveFaq} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2"><label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Question Payload</label><Input required value={editFaq.question} onChange={e => setEditFaq({...editFaq, question: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl" /></div>
                           <div className="space-y-2"><label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Model Category</label><Input required value={editFaq.category} onChange={e => setEditFaq({...editFaq, category: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Secure Answer Training</label><Textarea required value={editFaq.answer} onChange={(e: any) => setEditFaq({...editFaq, answer: e.target.value})} className="bg-black/40 border-white/10 rounded-xl min-h-[120px]" /></div>
                        
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-xl cursor-pointer" onClick={() => setEditFaq({...editFaq, isPublished: !editFaq.isPublished})}>
                           <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border border-white/10 ${editFaq.isPublished ? 'bg-emerald-500' : 'bg-transparent'}`}>{editFaq.isPublished && <CheckCircle2 className="w-3 h-3 text-white" />}</div>
                           <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest cursor-pointer select-none">
                              {editFaq.isPublished ? "Currently Live (Published globally to clients)" : "Currently Draft (Hidden from public APIs)"}
                           </label>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/5">
                           <Button type="submit" disabled={saving} variant="premium" className="rounded-xl px-10 h-10 gap-2 uppercase tracking-widest text-[10px] font-black"><Save className="w-4 h-4" /> Save FAQ Vector</Button>
                           <Button type="button" onClick={() => setEditFaq(null)} variant="ghost" className="rounded-xl px-8 h-10 uppercase tracking-widest text-[10px] font-black hover:bg-white/5 border border-white/5">Cancel Injection</Button>
                        </div>
                     </form>
                   </Card>
                </motion.div>
             )}
           </AnimatePresence>

           <div className="grid md:grid-cols-2 gap-6">
              {data.faqs.map(f => (
                 <Card key={f.id} className="p-6 rounded-[2rem] border-white/5 bg-card/40 hover:border-primary/20 transition-all flex flex-col justify-between group">
                    <div className="space-y-4">
                       <div className="flex justify-between items-start gap-4">
                          <span className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-full uppercase tracking-widest text-primary border border-primary/20">{f.category}</span>
                          <div className="flex gap-2 text-[10px] font-black tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                             <span className="text-emerald-400">👍 {data.questions.filter(q => q.source === "FAQ_FEEDBACK" && q.question === f.question && q.helpful === true).length}</span>
                             <span className="text-white/20">|</span>
                             <span className="text-red-400">👎 {data.questions.filter(q => q.source === "FAQ_FEEDBACK" && q.question === f.question && q.helpful === false).length}</span>
                          </div>
                       </div>
                       <h3 className="text-xl font-black">{f.question}</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                    </div>
                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/5">
                       <span className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${f.isPublished ? "text-emerald-400" : "text-amber-400"}`}><CheckCircle2 className="w-3 h-3" /> {f.isPublished ? "LIVE" : "DRAFT"}</span>
                       <div className="flex items-center gap-2">
                          <Button onClick={() => setEditFaq(f)} variant="outline" size="sm" className="rounded-lg h-8 text-[9px] font-black uppercase hover:bg-primary/20 hover:text-primary hover:border-primary/30 border-white/10 shadow-none"><Shield className="w-3 h-3 mr-1" /> Edit</Button>
                          <Button onClick={() => handleDeleteFaq(f.id)} variant="outline" size="sm" className="rounded-lg h-8 text-red-500 hover:bg-red-500/20 hover:text-red-400 border-red-500/20 shadow-none"><Trash className="w-3 h-3" /></Button>
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-8">
           <Button onClick={() => setEditFaq({ question: "", answer: "", category: "General", isPublished: true, isDoc: true })} variant="premium" className="h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-8 text-xs font-black uppercase tracking-widest shadow-xl flex gap-2"><Plus className="w-4 h-4" /> Inject Deep Support Document</Button>

           <AnimatePresence>
             {editFaq && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                   <Card className="p-8 rounded-[2rem] border-indigo-500/30 bg-indigo-500/5 space-y-6">
                     <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { await axios.post("/api/admin/support", { action: "UPSERT_DOC", payload: editFaq }); setEditFaq(null); fetchAuthData(); } catch (e: any) { console.error("SAVE_DOC_ERR:", e); showToast(e.response?.data?.message || "Failed to save document. Please try again.", "error") } finally { setSaving(false) } }} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2"><label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Document Title</label><Input required value={editFaq.question} onChange={e => setEditFaq({...editFaq, question: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl" /></div>
                           <div className="space-y-2"><label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Model Category</label><Input required value={editFaq.category} onChange={e => setEditFaq({...editFaq, category: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Secure Document Body Content</label><Textarea required value={editFaq.answer} onChange={(e: any) => setEditFaq({...editFaq, answer: e.target.value})} className="bg-black/40 border-white/10 rounded-xl min-h-[120px]" /></div>
                        
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-xl cursor-pointer" onClick={() => setEditFaq({...editFaq, isPublished: !editFaq.isPublished})}>
                           <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border border-white/10 ${editFaq.isPublished ? 'bg-indigo-500' : 'bg-transparent'}`}>{editFaq.isPublished && <CheckCircle2 className="w-3 h-3 text-white" />}</div>
                           <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest cursor-pointer select-none">
                              {editFaq.isPublished ? "Currently Live (Mapped inside Chatbot RAG Matrix)" : "Currently Draft (Hidden from Cybertron Context)"}
                           </label>
                        </div>

                        <div className="flex gap-4 pt-4 border-white/5 border-t">
                           <Button type="submit" disabled={saving} variant="premium" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-10 h-10 gap-2 uppercase tracking-widest text-[10px] font-black"><Save className="w-4 h-4" /> Save Document Vector</Button>
                           <Button type="button" onClick={() => setEditFaq(null)} variant="ghost" className="rounded-xl px-8 h-10 uppercase tracking-widest text-[10px] font-black hover:bg-white/5 border border-white/5">Cancel Injection</Button>
                        </div>
                     </form>
                   </Card>
                </motion.div>
             )}
           </AnimatePresence>

           <div className="grid md:grid-cols-2 gap-6">
              {data.docs.map(d => (
                 <Card key={d.id} className="p-6 rounded-[2rem] border-white/5 bg-card/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between group">
                    <div className="space-y-4">
                       <span className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-full uppercase tracking-widest text-indigo-400 border border-indigo-500/20">{d.category}</span>
                       <h3 className="text-xl font-black">{d.question}</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 opacity-80">{d.answer}</p>
                    </div>
                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/5">
                       <span className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${d.isPublished ? "text-emerald-400" : "text-amber-400"}`}><CheckCircle2 className="w-3 h-3" /> {d.isPublished ? "INDEXED" : "DRAFT"}</span>
                       <div className="flex items-center gap-2">
                          <Button onClick={() => setEditFaq({...d, isDoc: true})} variant="outline" size="sm" className="rounded-lg h-8 text-[9px] font-black uppercase hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 border-white/10 shadow-none"><Shield className="w-3 h-3 mr-1" /> Edit</Button>
                          <Button onClick={() => handleDeleteFaq(d.id, true)} variant="outline" size="sm" className="rounded-lg h-8 text-red-500 hover:bg-red-500/20 hover:text-red-400 border-red-500/20 shadow-none"><Trash className="w-3 h-3" /></Button>
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      )}
    </div>
  )
}
