"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon,
  History,
  Zap,
  ChevronDown,
  Search,
  MessageSquare,
  CreditCard,
  Home,
  Info,
  FileText,
  Wrench,
  Mail,
  HelpCircle,
  Heart
} from "lucide-react"
import { Button } from "@/components/common/button"
import { useSession, signOut } from "next-auth/react"
import { useCredits } from "@/hooks/use-credits"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { credits, isLoading: creditsLoading } = useCredits()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const userRole = (session?.user as any)?.role
  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/about", icon: Info },
    { name: "Blogs", href: "/blog", icon: FileText },
    { name: "Tools", href: "/tools", icon: Wrench },
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
  ]

  // Context-aware profile dropdown links
  const profileLinks = [
    {
      name: userRole === "ADMIN" ? "Admin Control" : "Dashboard",
      icon: LayoutDashboard,
      href: userRole === "ADMIN" ? "/admin" : "/dashboard"
    },
    ...(userRole === "ADMIN" ? [{ name: "Loves Curation", icon: Heart, href: "/admin/loves" }] : []),
    { name: "Aura History", icon: Zap, href: "/dashboard/history/credits" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    { name: "Saved", icon: History, href: "/dashboard/saved" },
    { name: "Billing", icon: CreditCard, href: "/pricing" },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 relative z-10 transition-transform active:scale-95">
          <img src="/logo.svg" alt="Astryxo Logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-white"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-6">

          {session ? (
            <div className="flex items-center gap-6">

              {/* Credits Badge */}
              <Link href="/pricing">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 group cursor-pointer hover:bg-primary/20 transition-all">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {creditsLoading ? "..." : credits ?? 0} Credits
                  </span>
                </div>
              </Link>


              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-2 group"
                >
                  <div className="w-9 h-9 rounded-full border-2 border-white/10 group-hover:border-primary/50 transition-all overflow-hidden bg-secondary">
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-card border border-white/5 rounded-2xl shadow-2xl p-2 z-[60] backdrop-blur-xl"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-xs font-black text-white truncate uppercase tracking-tight">{session.user?.name || "Member"}</p>
                        <p className="text-[9px] text-muted-foreground truncate font-medium">{session.user?.email}</p>
                      </div>

                      {profileLinks.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all group"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                        </Link>
                      ))}

                      <div className="h-px bg-white/5 my-2" />

                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-all w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest px-6 rounded-xl h-10 text-muted-foreground hover:text-white">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="premium" className="text-[10px] font-black uppercase tracking-widest px-8 rounded-xl h-10 shadow-xl shadow-primary/20">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-white/5 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-muted-foreground"
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-6" />
              {!session ? (
                <div className="flex flex-col gap-4">
                  <Button asChild variant="outline" className="w-full justify-center rounded-xl h-12 text-xs font-black uppercase tracking-widest">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="premium" className="w-full justify-center rounded-xl h-12 text-xs font-black uppercase tracking-widest">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {profileLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-muted-foreground"
                    >
                      <link.icon className="w-5 h-5 text-primary" />
                      {link.name}
                    </Link>
                  ))}
                  <div className="h-px bg-white/5 my-2" />
                  <Button onClick={() => signOut()} variant="outline" className="w-full justify-center rounded-xl h-12 text-xs font-black uppercase tracking-widest text-red-400 border-red-400/20">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
