"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Smartphone, Shield, Zap, Info, Check, RefreshCw, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/common/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Settings = {
   inAppEnabled: boolean
   emailEnabled: boolean
   successEnabled: boolean
   errorEnabled: boolean
   warningEnabled: boolean
   creditEnabled: boolean
   systemEnabled: boolean
}

const NOTIFICATION_TYPES = [
   { id: "SUCCESS", field: "successEnabled", label: "Success Confirmations", desc: "When actions complete successfully.", icon: Check },
   { id: "ERROR", field: "errorEnabled", label: "Error Alerts", desc: "Critical system errors and failures.", icon: Shield },
   { id: "WARNING", field: "warningEnabled", label: "Warnings", desc: "Potential issues requiring attention.", icon: Info },
   { id: "CREDIT", field: "creditEnabled", label: "Credit Updates", desc: "Notifications about your Aura balance.", icon: Zap },
   { id: "SYSTEM", field: "systemEnabled", label: "System Updates", desc: "News about new features and maintenance.", icon: Bell },
] as const

export default function NotificationSettingsPage() {
   const [settings, setSettings] = useState<Settings | null>(null)
   const [isLoading, setIsLoading] = useState(true)
   const [isSaving, setIsSaving] = useState(false)
   const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
   const router = useRouter()

   useEffect(() => {
      fetchSettings()
   }, [])

   const fetchSettings = async () => {
      try {
         const res = await fetch("/api/user/notifications/settings")
         const data = await res.json()
         if (data.success && data.settings) {
            setSettings(data.settings)
         }
      } catch (error) {
         console.error("Failed to fetch settings:", error)
      } finally {
         setIsLoading(false)
      }
   }

   const toggleType = (field: keyof Settings) => {
      if (!settings) return
      setSettings(prev => prev ? ({
         ...prev,
         [field]: !prev[field]
      }) : null)
   }

   const saveSettings = async () => {
      if (!settings) return
      setIsSaving(true)
      setSaveStatus("idle")
      try {
         const res = await fetch("/api/user/notifications/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
         })
         if (res.ok) {
            setSaveStatus("success")
            setTimeout(() => setSaveStatus("idle"), 3000)
         } else {
            setSaveStatus("error")
         }
      } catch {
         setSaveStatus("error")
      } finally {
         setIsSaving(false)
      }
   }

   if (isLoading) {
      return (
         <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Accessing preferences...</p>
         </div>
      )
   }

   return (
      <div className="min-h-screen bg-black text-white p-6 md:p-10">
         <div className="max-w-3xl mx-auto space-y-10">

            {/* Breadcrumb */}
            <Link href="/dashboard/notifications" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
               <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">Back to notifications</span>
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent uppercase tracking-tighter">
                     Preferences
                  </h1>
                  <p className="text-gray-400 text-sm">Fine-tune your spectral connection.</p>
               </div>
               <Button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className={`min-w-[120px] rounded-xl font-black text-xs uppercase tracking-widest transition-all ${saveStatus === 'success' ? 'bg-green-600' : saveStatus === 'error' ? 'bg-red-600' : 'bg-indigo-600'}`}
               >
                  {isSaving ? "Saving..." : saveStatus === 'success' ? "Saved!" : saveStatus === 'error' ? "Error!" : "Save Changes"}
               </Button>
            </div>

            {/* Global Toggles */}
            <div className="grid md:grid-cols-2 gap-6">
               <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-3xl border transition-all ${settings?.inAppEnabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}
               >
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-2xl ${settings?.inAppEnabled ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                        <Bell className="w-6 h-6" />
                     </div>
                     <button
                        onClick={() => toggleType('inAppEnabled')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings?.inAppEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.inAppEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                  <h3 className="font-bold text-lg">In-App Notifications</h3>
                  <p className="text-xs text-gray-500 mt-1">Receive alerts inside the platform.</p>
               </motion.div>

               <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-3xl border transition-all ${settings?.emailEnabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'}`}
               >
                  <div className="flex items-start justify-between mb-4">
                     <div className={`p-3 rounded-2xl ${settings?.emailEnabled ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                        <Mail className="w-6 h-6" />
                     </div>
                     <button
                        onClick={() => toggleType('emailEnabled')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings?.emailEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.emailEnabled ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                  <h3 className="font-bold text-lg">Email Alerts</h3>
                  <p className="text-xs text-gray-500 mt-1">Get important updates via email.</p>
               </motion.div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-500 pl-2">Notification Channels</h2>
               <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                  {NOTIFICATION_TYPES.map((type, idx) => {
                     const isEnabled = settings ? Boolean(settings[type.field as keyof Settings]) : false
                     return (
                        <div
                           key={type.id}
                           className={`flex items-center justify-between p-6 transition-all ${idx !== NOTIFICATION_TYPES.length - 1 ? 'border-b border-white/5' : ''
                              } ${!isEnabled ? 'bg-transparent grayscale opacity-50' : 'bg-white/[0.02]'}`}
                        >
                           <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isEnabled ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                 <type.icon className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm tracking-tight">{type.label}</h4>
                                 <p className="text-xs text-gray-500">{type.desc}</p>
                              </div>
                           </div>
                           <button
                              onClick={() => toggleType(type.field as keyof Settings)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isEnabled
                                    ? 'bg-indigo-600/10 border-indigo-600/30 text-indigo-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-400'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-500'
                                 }`}
                           >
                              {isEnabled ? "Enabled" : "Disabled"}
                           </button>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* Security Warning */}
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
               <Smartphone className="w-6 h-6 text-amber-500 flex-shrink-0" />
               <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-500 uppercase tracking-tighter">Mobile Alerts Coming Soon</h4>
                  <p className="text-xs text-amber-500/60 leading-relaxed">
                     We are working on bringing native spectral push notifications to your mobile devices. Stay tuned for the next manifestation.
                  </p>
               </div>
            </div>
         </div>
      </div>
   )
}

