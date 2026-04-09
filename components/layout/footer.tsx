import Link from "next/link"
import { Sparkles, MessageCircle, Code, Shield } from "lucide-react"
import { Twitter, Github, Linkedin } from "./icons"
import { Button } from "@/components/common/button"

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-white/5 mt-auto pt-24 pb-12 px-6 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
        <div className="space-y-8 md:pr-12">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="Astryxo Logo" className="h-10 w-auto" />
          </Link>
          <p className="text-muted-foreground text-[11px] leading-relaxed max-w-sm font-black uppercase tracking-widest italic opacity-60">
            Next-Gneration visual intelligence mapping. Distributed generation at the edge of the network.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group">
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group">
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-8 leading-none">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="/tools" className="text-sm text-white/70 hover:text-primary transition-all hover:translate-x-1 inline-block italic font-bold">All Tools</Link></li>
            <li><Link href="/pricing" className="text-sm text-white/70 hover:text-primary transition-all hover:translate-x-1 inline-block italic font-bold">Spectral Credits</Link></li>
            <li><Link href="#" className="text-sm text-white/40 cursor-not-allowed italic font-bold flex items-center gap-2">Developer API <span className="text-[9px] bg-white/5 border border-white/10 rounded-full px-2 py-0.5">Soon</span></Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-8 leading-none">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/about" className="text-sm text-white/70 hover:text-primary transition-all hover:translate-x-1 inline-block italic font-bold">About Us</Link></li>
            <li><Link href="/blog" className="text-sm text-white/70 hover:text-primary transition-all hover:translate-x-1 inline-block italic font-bold">Spectral Journal</Link></li>
            <li><Link href="/contact" className="text-sm text-white/70 hover:text-primary transition-all hover:translate-x-1 inline-block italic font-bold">Connect</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-white/30 uppercase tracking-[0.3em] font-black relative z-10">
        <p>© 2026 Astryxo AI. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
