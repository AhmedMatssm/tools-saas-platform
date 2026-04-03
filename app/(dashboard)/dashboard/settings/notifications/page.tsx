"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Mail, Shield, CheckCircle, AlertTriangle, Zap, Info, Loader2, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/common/button"
import { Card } from "@/components/common/card"
import { motion } from "framer-motion"
import Link from "next/link"
import axios from "axios"

const DEFAULT_SETTINGS = {
  inAppEnabled: true,
  emailEnabled: true,
  successEnabled: true,
  errorEnabled: true,
  warningEnabled: true,
  creditEnabled: true,
  systemEnabled: true
}

export default function NotificationSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/user/notifications/settings")
        setSettings(res.data.settings)
      } catch (err) {
        console.error("Failed to load notification settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const saveSettings = async (updatedFields: any) => {
    setSaving(true)
    try {
      const res = await axios.patch("/api/user/notifications/settings", updatedFields)
      setSettings(res.data.settings)
      showToast("Notification preferences updated.")
    } catch (err) {
      showToast("Failed to save settings.", "error")
    } finally {
      setSaving(false)
    }
  }

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = (key: string) => {
    const current = settings || DEFAULT_SETTINGS
    const newVal = !current[key]
    const updated = { ...current, [key]: newVal }
    setSettings(updated)
    saveSettings({ [key]: newVal })
  }

  const activeSettings = settings || DEFAULT_SETTINGS

  if (loading) {

     return (
       <div className="flex h-[400px] items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 px-6">
      {/* Toast Notification */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-24 right-10 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.msg}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to General Settings
          </Link>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-500" />
            Notification Preferences
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-60">Control how and when you want to be notified</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Channels */}
        <Card className="p-8 border-white/5 bg-white/[0.02] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-widest uppercase">1. Delivery Channels</h3>
            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">Where should notifications reach you?</p>
          </div>

          <div className="space-y-3">
            {[
              { id: "inAppEnabled", label: "In-App Notifications", desc: "Show in the dashboard bell and activity log", icon: Bell },
              { id: "emailEnabled", label: "Email Alerts", desc: "Receive updates directly in your inbox", icon: Mail },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">{item.label}</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  disabled={saving}
                  className={`w-11 h-6 rounded-full relative transition-all ${activeSettings[item.id] ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-white/10"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${activeSettings[item.id] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Global Notification Types */}
        <Card className="p-8 border-white/5 bg-white/[0.02] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-widest uppercase">2. Notification Types</h3>
            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">Which events do you care about?</p>
          </div>

          <div className="space-y-2">
            {[
              { id: "successEnabled", label: "Success Confirmations", desc: "Completed generations and successful actions", icon: CheckCircle, color: "text-emerald-500" },
              { id: "errorEnabled", label: "Error Alerts", desc: "Failed generations and critical system errors", icon: Shield, color: "text-red-500" },
              { id: "warningEnabled", label: "Warning Alerts", desc: "Usage limits and security warnings", icon: AlertTriangle, color: "text-amber-500" },
              { id: "creditEnabled", label: "Credit Updates", desc: "Refills, rewards, and consumption alerts", icon: Zap, color: "text-purple-500" },
              { id: "systemEnabled", label: "System Updates", desc: "Maintenance news and platform feature logs", icon: Info, color: "text-blue-500" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/40 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider">{item.label}</h4>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  disabled={saving}
                  className={`w-9 h-5 rounded-full relative transition-all ${activeSettings[item.id] ? "bg-emerald-600" : "bg-white/5"}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-all ${activeSettings[item.id] ? "left-5" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-8 border-indigo-500/20 bg-indigo-500/[0.03] text-center border-dashed">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          Settings are auto-saved and synchronized across all your devices
        </p>
      </Card>
    </div>
  )
}
