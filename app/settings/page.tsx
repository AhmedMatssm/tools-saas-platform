"use client"

import { useState, useEffect } from "react"
import { useSession, signOut, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  User, Shield, Bell, CreditCard,
  LogOut, Loader2, Check, X, Eye, EyeOff,
  Lock, Zap, AlertTriangle, Settings, Copy, Monitor, Calendar, History
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"

/* ─── Types ─────────────────────────────────────────────── */
type Tab = "account" | "password" | "billing" | "security" | "history" | "notifications"

/* ─── Toast helper ───────────────────────────────────────── */
function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fire = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }
  return { toast, fire }
}

/* ─── Input component ────────────────────────────────────── */
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <input
        {...props}
        className={`w-full h-12 bg-background/60 border border-border rounded-xl px-4 outline-none focus:border-primary/50 text-sm transition-all ${props.disabled ? "cursor-not-allowed opacity-50" : ""} ${props.className || ""}`}
      />
    </div>
  )
}

/* ─── Section wrapper ────────────────────────────────────── */
function Section({ title, subtitle, accent = "primary", children }: { title: string; subtitle?: string; accent?: string; children: React.ReactNode }) {
  return (
    <Card className="p-8 md:p-10 space-y-8 border-white/5 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-blue-600 opacity-60" />
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">{subtitle}</p>}
      </div>
      {children}
    </Card>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast, fire } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>("account")
  const router = useRouter()

  const [loadingConfig, setLoadingConfig] = useState(true)
  const [userConfig, setUserConfig] = useState<any>(null)

  /* account */
  const [name, setName] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [deletePwd, setDeletePwd] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  /* password */
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [isSavingPwd, setIsSavingPwd] = useState(false)

  /* notifications & prefs */
  const [notifs, setNotifs] = useState({
    marketing: false,
    security: true,
    updates: true,
    digest: false,
  })

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/user/settings")
        setUserConfig(res.data.data)
        if(res.data.data.emailAlerts !== undefined) {
           setNotifs(n => ({...n, updates: res.data.data.emailAlerts}))
        }
      } catch (e) {
        console.error("Failed to fetch settings config")
      } finally {
        setLoadingConfig(false)
      }
    }
    fetchSettings()
  }, [])

  /* ── API Configuration Wrapper for the Unified Settings API  ── */
  const runAction = async (action: string, payload: any = {}) => {
    try {
      const res = await axios.post("/api/user/settings", { action, payload })
      if(action === "UPDATE_PREFS") {
         setUserConfig((prev: any) => ({...prev, ...payload}))
      }
      return res.data
    } catch (e: any) {
      throw new Error(e.response?.data?.error || "Action failed")
    }
  }

  /* ── Save Profile ─────────────────────────────────────── */
  const handleSaveProfile = async () => {
    if (!name.trim()) return fire("Name cannot be empty", false)
    setIsSavingProfile(true)
    try {
      await axios.patch("/api/account/update", { name: name.trim() })
      await getSession()   // invalidates the client-side session cache
      router.refresh()     // re-renders server components with new data
      fire("Profile updated successfully")
    } catch (e: any) {
      fire(e.response?.data?.error || "Failed to update profile", false)
    } finally {
      setIsSavingProfile(false)
    }
  }

  /* ── Change Password ──────────────────────────────────── */
  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) return fire("All fields are required", false)
    if (newPwd !== confirmPwd) return fire("New passwords do not match", false)
    if (newPwd.length < 8) return fire("New password must be at least 8 characters", false)
    setIsSavingPwd(true)
    try {
      await axios.patch("/api/account/password", { currentPassword: currentPwd, newPassword: newPwd })
      fire("Password changed successfully")
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    } catch (e: any) {
      fire(e.response?.data?.error || "Failed to change password", false)
    } finally {
      setIsSavingPwd(false)
    }
  }

  /* ── Delete Account ───────────────────────────────────── */
  const handleDeleteAccount = async () => {
    if(!deletePwd) return fire("Password required to delete account", false)
    try {
      await runAction("DELETE_ACCOUNT", { password: deletePwd })
      fire("Account deleted.")
      signOut({ callbackUrl: "/" })
    } catch (e: any) {
       fire(e.message, false)
    }
  }

  /* ── API Keys ─────────────────────────────────────────── */
  const handleGenerateKey = async () => {
    try {
      const res = await runAction("GENERATE_API_KEY")
      setUserConfig({ ...userConfig, apiKey: res.apiKey })
      fire("API Key generated")
    } catch(e: any) { fire(e.message, false) }
  }

  const handleRevokeKey = async () => {
    try {
      await runAction("REVOKE_API_KEY")
      setUserConfig({ ...userConfig, apiKey: null })
      fire("API Key revoked")
    } catch(e: any) { fire(e.message, false) }
  }

  const handleCopyKey = () => {
     if(userConfig?.apiKey) {
       navigator.clipboard.writeText(userConfig.apiKey)
       fire("API Key copied to clipboard")
     }
  }

  /* ── Preferences ──────────────────────────────────────── */
  const toggleNotificationPref = async (key: string, value: boolean) => {
     setNotifs(n => ({ ...n, [key]: value }))
     if(key === "updates") {
        try { await runAction("UPDATE_PREFS", { emailAlerts: value }) } catch(e) {}
     }
  }

  /* ── Tabs config ──────────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "billing", label: "Billing & Credits", icon: CreditCard },
    { id: "security", label: "Security & API", icon: Shield },
    { id: "history", label: "Activity Logs", icon: History },
    { id: "notifications", label: "Preferences", icon: Bell },
  ]

  const pwdStrength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) ? 4 : 3
  const pwdColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"]
  const pwdLabels = ["", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-24 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl ${toast.ok ? "bg-emerald-500 text-white" : "bg-destructive text-white"}`}
          >
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
          <Settings className="w-8 h-8 text-primary" />
          Settings <span className="text-primary">&</span> Details
        </h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-black">
          Signed in as <span className="text-white">{session?.user?.email}</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="w-full md:w-56 space-y-2 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab.id
                  ? "bg-primary/10 border-primary/30 text-primary scale-[1.02]"
                  : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}

          <div className="pt-6 border-t border-white/5 mt-6">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Content ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-6">
          {loadingConfig ? (
             <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : (
          <AnimatePresence mode="wait">

            {/* ─ ACCOUNT ─ */}
            {activeTab === "account" && (
              <motion.div key="account" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
                <Section title="Profile Details" subtitle="Update your public information">
                  {/* Avatar placeholder */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-premium flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      {name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-black">{session?.user?.name || "Your Name"}</p>
                      <p className="text-xs text-muted-foreground italic">{session?.user?.email}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Full Name *" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                    <Field label="Email (read-only)" value={session?.user?.email || ""} disabled type="email" />
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <Button onClick={() => setName(session?.user?.name || "")} variant="ghost" className="rounded-xl px-8 text-xs font-black uppercase tracking-widest">
                      Discard
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} variant="premium" className="rounded-xl px-10 h-11 text-xs font-black uppercase tracking-widest shadow-lg gap-2">
                      {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Profile
                    </Button>
                  </div>
                </Section>

                {/* Danger Zone */}
                <Card className="p-8 border-red-500/15 bg-red-500/[0.03]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <h4 className="text-base font-black text-red-500">Delete Account</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Permanently delete your account and all your data. This cannot be undone.</p>
                    </div>
                    {!showDeleteConfirm ? (
                      <Button onClick={() => setShowDeleteConfirm(true)} variant="outline" className="border-red-500/40 text-red-500 hover:bg-red-500/10 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest h-11 shrink-0">
                        Initiate Deletion
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
                         <input type="password" placeholder="Confirm Password" value={deletePwd} onChange={e => setDeletePwd(e.target.value)} className="w-full h-10 px-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs outline-none focus:border-red-500" />
                         <div className="flex gap-2">
                            <Button onClick={() => setShowDeleteConfirm(false)} variant="ghost" className="flex-1 text-[10px] font-black uppercase h-8 hover:bg-white/5">Cancel</Button>
                            <Button onClick={handleDeleteAccount} className="flex-1 bg-red-500 hover:bg-red-600 text-white h-8 text-[10px] font-black uppercase rounded-lg">Confirm</Button>
                         </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─ PASSWORD ─ */}
            {activeTab === "password" && (
              <motion.div key="password" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
                <Section title="Change Password" subtitle="Keep your account secure with a strong password">
                  <div className="space-y-5">
                    {/* Current password */}
                    <Field
                      label="Current Password *"
                      type={showPwd ? "text" : "password"}
                      value={currentPwd}
                      onChange={e => setCurrentPwd(e.target.value)}
                      placeholder="Your current password"
                    />

                    {/* New password */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password *</label>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full h-12 bg-background/60 border border-border rounded-xl px-4 pr-12 outline-none focus:border-primary/50 text-sm transition-all"
                        />
                        <button
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {newPwd.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwdStrength ? pwdColors[pwdStrength] : "bg-white/10"}`} />
                            ))}
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${pwdColors[pwdStrength].replace("bg-", "text-")}`}>
                            {pwdLabels[pwdStrength]}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password *</label>
                      <input
                        type={showPwd ? "text" : "password"}
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        placeholder="Repeat your new password"
                        className={`w-full h-12 bg-background/60 border rounded-xl px-4 outline-none text-sm transition-all ${
                          confirmPwd && (confirmPwd === newPwd ? "border-emerald-500/50" : "border-red-500/50")
                        } ${!confirmPwd ? "border-border" : ""} focus:border-primary/50`}
                      />
                      {confirmPwd && confirmPwd !== newPwd && (
                        <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isSavingPwd || !currentPwd || !newPwd || !confirmPwd}
                      variant="premium"
                      className="rounded-xl px-10 h-11 text-xs font-black uppercase tracking-widest shadow-lg gap-2"
                    >
                      {isSavingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Update Password
                    </Button>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* ─ BILLING ─ */}
            {activeTab === "billing" && (
              <motion.div key="billing" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
                <Section title="Billing & Credits Data" subtitle="Manage your platform subscription limit & plan">
                  {/* Current Plan & Credits Banner */}
                  <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Current Plan: <span className="text-white bg-primary/20 px-2 py-0.5 rounded ml-1">{userConfig?.plan}</span></p>
                      </div>
                      <h3 className="text-3xl font-black">{Math.max(0, userConfig?.credits || 0)} Credits Left</h3>
                      <p className="text-xs text-muted-foreground">Credits reset on next billing cycle ({userConfig?.billingCycle ? new Date(userConfig.billingCycle).toLocaleDateString() : "Never"})</p>
                    </div>
                    {userConfig?.plan !== "PRO" && (
                       <Button onClick={() => fire("Live Stripe Checkout is needed for this.")} variant="premium" className="rounded-xl px-8 h-11 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                         Upgrade to Pro
                       </Button>
                    )}
                  </div>

                  {/* Plan comparison */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Free", price: "$0/mo", features: ["10 generations/day", "Standard quality"], current: userConfig?.plan === "FREE" },
                      { name: "Pro", price: "$19/mo", features: ["1,000 generations", "HD quality", "API access"], current: userConfig?.plan === "PRO" },
                      { name: "Enterprise", price: "Custom", features: ["Custom models", "SLA guarantee", "Dedicated support"], current: userConfig?.plan === "ENTERPRISE" },
                    ].map(plan => (
                      <div key={plan.name} className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${plan.current ? "border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "border-white/5 bg-card/30"}`}>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <h4 className="font-black text-sm uppercase tracking-widest">{plan.name}</h4>
                             {plan.current && <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">Active</span>}
                           </div>
                           <p className="text-2xl font-black">{plan.price}</p>
                           <ul className="space-y-2">
                             {plan.features.map(f => (
                               <li key={f} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                 <Check className="w-3 h-3 text-primary shrink-0" /> {f}
                               </li>
                             ))}
                           </ul>
                        </div>
                        {!plan.current && (
                          <Button onClick={() => fire(plan.name === "Enterprise" ? "Please email enterprise@astral.ai" : "Please integrate stripe to continue checkout!")} variant={plan.name === "Pro" ? "premium" : "outline"} className="w-full rounded-xl h-10 text-[10px] font-black uppercase tracking-widest">
                            {plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Payment processing will be securely hosted by <strong className="text-white">Stripe</strong>. No payment info is stored here.</p>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* ─ SECURITY & API KEYS ─ */}
            {activeTab === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
                <Section title="Security & API" subtitle="Manage your account API keys, 2FA, and Active Sessions">
                  <div className="space-y-4">
                     
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Native API Access Key</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm">Use your unique API key to safely interact with our endpoints externally. Do not share your key or expose it in client-side code.</p>
                        </div>
                        <div className="w-full md:w-auto">
                           {userConfig?.apiKey ? (
                              <div className="space-y-2">
                                 <div className="flex items-center gap-2 bg-black px-4 py-2.5 rounded-xl border border-white/10">
                                   <input readOnly value={userConfig.apiKey} className="bg-transparent text-xs font-mono text-emerald-400 w-48 outline-none" type="password" />
                                   <button onClick={handleCopyKey} className="text-muted-foreground hover:text-white transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                                 </div>
                                 <Button onClick={handleRevokeKey} variant="outline" className="w-full rounded-xl text-[10px] font-black uppercase border-red-500/30 text-red-500 hover:bg-red-500/10 h-8">Revoke Selected API Key</Button>
                              </div>
                           ) : (
                              <Button onClick={handleGenerateKey} variant="premium" className="rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest whitespace-nowrap"><Zap className="w-4 h-4 mr-2" /> Generate API Key</Button>
                           )}
                        </div>
                     </div>

                    {[
                      {
                        title: "Two-Factor Authentication",
                        desc: "Add an extra layer of protection using an authenticator app.",
                        status: userConfig?.twoFactorEnabled ? "Active & Secured" : "Not enabled",
                        statusColor: userConfig?.twoFactorEnabled ? "text-emerald-400" : "text-amber-400",
                        action: userConfig?.twoFactorEnabled ? "Disable" : "Enable 2FA",
                        variant: "outline" as const,
                      },
                      {
                        title: "Active Device Sessions Tracker",
                        desc: "View devices actively tapped into your authentication layer.",
                        status: `${Math.max(1, userConfig?.logins?.length || 1)} Active Session(s)`,
                        statusColor: "text-emerald-400",
                        action: "Sign Out All",
                        variant: "outline" as const,
                      },
                    ].map(item => (
                      <div key={item.title} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${item.statusColor}`}>{item.status}</p>
                        </div>
                        <Button variant={item.variant} className="rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest shrink-0 border-white/10"
                          onClick={() => fire(`We are setting up ${item.title} to work natively soon!`, false)}>
                          {item.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Recent Login Activity" subtitle="Last verified user sign-in events">
                  <div className="space-y-3">
                     {userConfig?.logins?.length > 0 ? userConfig.logins.map((event: any) => (
                      <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-2 md:gap-0">
                        <div className="flex items-center gap-3">
                           <Monitor className="w-5 h-5 text-muted-foreground opacity-50" />
                           <div>
                             <p className="text-xs font-black uppercase tracking-wider">{event.device || "Unknown Client"}</p>
                             <p className="text-[10px] font-mono text-muted-foreground tracking-widest">{event.ip || "127.0.0.1"} · {new Date(event.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full self-start md:self-auto border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Successful Payload</span>
                      </div>
                     )) : (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                           <div className="flex items-center gap-3"><Monitor className="w-5 h-5 text-emerald-500" />
                              <div><p className="text-xs font-black uppercase tracking-wider">Current Local Active Device</p><p className="text-[10px] font-mono text-muted-foreground tracking-widest">IP: LOCALHOST · Active Core Session</p></div>
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-center">Synchronized</span>
                        </div>
                     )}
                  </div>
                </Section>
              </motion.div>
            )}

            {/* ─ ACTIVITY LOGS ─ */}
            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
                <Section title="Recent Vision Activity" subtitle="Check out the historical ledger for your most recent image generations">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userConfig?.generations?.length > 0 ? userConfig.generations.map((gen: any) => (
                         <div key={gen.id} className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden group">
                           <div className="h-40 w-full overflow-hidden bg-black/50 border-b border-white/5">
                              <img src={gen.imageUrl} alt={gen.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                           <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                              <p className="text-sm font-black line-clamp-2 leading-relaxed tracking-tight" title={gen.prompt}>{gen.prompt}</p>
                              <div className="flex justify-between items-center text-[9px] uppercase font-black text-muted-foreground tracking-widest">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(gen.createdAt).toLocaleDateString()}</span>
                                <span className="text-primary font-mono opacity-60">ID:{gen.id.slice(-6)}</span>
                              </div>
                           </div>
                         </div>
                      )) : (
                         <div className="md:col-span-2 text-center py-10 opacity-50 flex flex-col items-center">
                            <History className="w-10 h-10 mb-4 text-muted-foreground" />
                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No recent image generations logged.</p>
                         </div>
                      )}
                   </div>
                </Section>
              </motion.div>
            )}

            {/* ─ NOTIFICATIONS ─ */}
            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Section title="Global Settings Preferences" subtitle="Platform behavior and Email toggles">
                  <div className="space-y-4">
                    {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, value]) => {
                      const labels: Record<keyof typeof notifs, { title: string; desc: string }> = {
                        marketing: { title: "Product Promos", desc: "New features, offers, and platform news." },
                        security: { title: "Security Alerts", desc: "Login notifications and suspicious activity warnings." },
                        updates: { title: "Essential Platform Alerts", desc: "Important changes tracked securely natively to DB state and your account updates." },
                        digest: { title: "Weekly Generation Ledger", desc: "A weekly round-up of your creations and platform activity via Email." },
                      }
                      return (
                        <div key={key} className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
                          <div className="space-y-1 pr-6">
                            <h4 className="text-sm font-black">{labels[key].title} {key === 'updates' && <span className="opacity-50 text-[10px] ml-1 uppercase">(Syncs to DB)</span>}</h4>
                            <p className="text-xs text-muted-foreground">{labels[key].desc}</p>
                          </div>
                          <button
                            onClick={() => toggleNotificationPref(key, !value)}
                            className={`relative w-12 h-6 rounded-full transition-all shrink-0 border border-white/5 shadow-inner ${value ? "bg-primary" : "bg-black"}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-6" : "left-1"}`} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <Button
                      onClick={() => fire(userConfig?.language === "EN" ? "Saved correctly" : "Updated")}
                      variant="premium"
                      className="rounded-xl px-10 h-11 text-xs font-black uppercase tracking-widest shadow-lg gap-2"
                    >
                      <Check className="w-4 h-4" /> Save General Core States
                    </Button>
                  </div>
                </Section>
              </motion.div>
            )}

          </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  )
}
