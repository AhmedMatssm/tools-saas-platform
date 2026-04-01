"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Library, 
  Search, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash, 
  Eye, 
  CheckCircle, 
  Clock, 
  Type, 
  Image as ImageIcon, 
  Sparkles, 
  Video 
} from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

const contentItems = [
  { id: 1, title: "FluxImage Gen Pro", type: "Tool", status: "Published", author: "Admin", date: "Mar 22, 2024", icon: ImageIcon },
  { id: 2, title: "Future of AI in Design", type: "Blog", status: "Draft", author: "Alex Rivers", date: "Mar 18, 2024", icon: Type },
  { id: 3, title: "Smart Upscale v2", type: "Tool", status: "Published", author: "Admin", date: "Mar 15, 2024", icon: Sparkles },
  { id: 4, title: "How to Prompt Like a Pro", type: "Blog", status: "Published", author: "Sarah J.", date: "Mar 10, 2024", icon: Type },
  { id: 5, title: "Neural Motion Engine", type: "Tool", status: "Archived", author: "Admin", date: "Feb 28, 2024", icon: Video },
]

export default function ContentAdminPage() {
  const [activeType, setActiveType] = useState("All")

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
             <h1 className="text-4xl font-black flex items-center gap-3">
               <Library className="w-8 h-8 text-blue-500" />
               Content <span className="text-blue-500">Manager</span>
             </h1>
             <p className="text-muted-foreground text-sm uppercase tracking-widest font-black italic">Manage platform tools, articles, and resources</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Search content..." className="w-full bg-surface border border-border p-3 pl-10 rounded-xl outline-none text-xs focus:border-blue-500/50 transition-all font-bold placeholder:font-normal" />
             </div>
             <Button variant="premium" className="h-11 rounded-xl px-6 shadow-xl gap-2 text-xs font-black uppercase tracking-widest">
                <Plus className="w-4 h-4" />
                Create New
             </Button>
          </div>
       </div>

       {/* Filter Bar */}
       <div className="flex gap-2 overflow-x-auto pb-4 scroll-smooth">
          {["All", "Tools", "Blog Posts", "Categories", "Docs"].map(tab => (
             <Button 
               key={tab} 
               variant={activeType === tab ? "primary" : "outline"}
               onClick={() => setActiveType(tab)}
               className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest transition-all"
             >
                {tab}
             </Button>
          ))}
       </div>

       {/* Content Table Card */}
       <Card className="p-8 space-y-8 overflow-hidden border-white/5 bg-surface shadow-3xl rounded-3xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground pb-4 block md:table-row">
                     <th className="pb-6 pr-6">Content Piece</th>
                     <th className="pb-6 pr-6">Status</th>
                     <th className="pb-6 pr-6">Owner</th>
                     <th className="pb-6 pr-6">Release Date</th>
                     <th className="pb-6 text-right">Settings</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                   {contentItems.map((item, i) => (
                      <tr key={i} className="group hover:bg-surface-hover/30 transition-all duration-300">
                         <td className="py-6 pr-6">
                            <div className="flex gap-4 items-center">
                               <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center border border-border group-hover:bg-blue-600 transition-colors">
                                  <item.icon className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
                               </div>
                               <div className="space-y-1">
                                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.title}</p>
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 italic">{item.type}</p>
                               </div>
                            </div>
                         </td>
                         <td className="py-6 pr-6">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border ${item.status === 'Published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : item.status === 'Draft' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-surface-hover text-muted-foreground border-border opacity-50'}`}>
                               {item.status}
                            </span>
                         </td>
                         <td className="py-6 pr-6 text-xs text-white font-bold">{item.author}</td>
                         <td className="py-6 pr-6 text-[10px] text-muted-foreground font-black uppercase italic tracking-widest">{item.date}</td>
                         <td className="py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors border border-transparent hover:border-gray-700">
                                  <Eye className="w-4 h-4 text-muted-foreground hover:text-white" />
                               </button>
                               <button className="p-2 hover:bg-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-500/50">
                                  <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                               </button>
                               <button className="p-2 hover:bg-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/50">
                                  <Trash className="w-4 h-4 text-muted-foreground hover:text-white" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </Card>

       {/* Bulk Actions Badge */}
       <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-12 duration-500 z-50 invisible group-has-[:checked]:visible">
          <p className="text-xs font-black uppercase tracking-widest">3 items selected</p>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex gap-4">
             <button className="text-[10px] font-black uppercase tracking-[2px] hover:underline">Publish Selected</button>
             <button className="text-[10px] font-black uppercase tracking-[2px] hover:underline text-red-200">Delete Permanently</button>
          </div>
       </div>
    </div>
  )
}
