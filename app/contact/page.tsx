"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/common/card"
import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Textarea } from "@/components/common/textarea"
import { ShieldAlert, Send, Loader2, CheckCircle2, Shield } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(3000, "Too long."),
})

export default function SecureContactPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")
    try {
      // Client-side strict validation
      formSchema.parse(form)
      
      const resp = await axios.post("/api/contact", form)
      if (resp.data.success) {
        setSuccess(true)
        setForm({ ...form, subject: "", message: "" })
      }
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        setErrorMsg(e.errors[0].message)
      } else {
        setErrorMsg(e.response?.data?.error || "An unexpected security block occurred.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 bg-grid-white/5 opacity-20 pointer-events-none" />
       
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full">
         <div className="text-center mb-10 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase"><Shield className="w-8 h-8 text-primary inline-block mb-2 mr-3" /> Support <span className="text-primary">Portal</span></h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-black">Encrypted & Secure Communication Channel</p>
         </div>

         {success ? (
            <Card className="p-12 text-center space-y-6 rounded-[3rem] border-emerald-500/20 bg-emerald-500/5 shadow-2xl">
               <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-widest text-emerald-400">Message Secured</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">Your inquiry has been stored securely in our database. Our unified AI system and admin support team will review it shortly.</p>
               <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4 rounded-full border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 uppercase font-black text-[10px] tracking-widest px-8">Submit Another Inquiry</Button>
            </Card>
         ) : (
           <Card className="p-8 md:p-12 rounded-[3rem] border-white/5 bg-card/40 backdrop-blur-xl shadow-2xl">
             <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                   <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-black uppercase tracking-widest">
                     <ShieldAlert className="w-4 h-4" /> {errorMsg}
                   </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <Input disabled={!!session?.user?.name} required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl bg-white/5 border-white/10" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Trace</label>
                    <Input disabled={!!session?.user?.email} required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-12 rounded-xl bg-white/5 border-white/10" placeholder="hello@astral.ai" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject Matter</label>
                  <Input required minLength={3} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="h-12 rounded-xl bg-white/5 border-white/10" placeholder="What requires attention?" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Encrypted Payload (Message)</label>
                  <Textarea required minLength={10} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="min-h-[160px] rounded-xl bg-white/5 border-white/10 resize-none p-4" placeholder="Describe your issue securely..." />
                </div>

                <Button disabled={isSubmitting} variant="premium" className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                   {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Dispatch Securely</>}
                </Button>
                
                <p className="text-[8px] text-center uppercase tracking-widest text-muted-foreground opacity-50 font-black pt-4">Payload protected by reCAPTCHA & SSL End-to-End Encryption. IP logged to prevent automated abuse.</p>
             </form>
           </Card>
         )}
       </motion.div>
    </div>
  )
}
