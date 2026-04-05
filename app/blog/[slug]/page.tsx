import prisma from "@/lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import ShareButtons from "@/components/blog/share-buttons"
import BlogInteractions from "@/components/blog/blog-interactions"
import { filterXSS, getDefaultWhiteList } from "xss"

export const revalidate = 60 // ISR: regenerate page every 60 seconds

// ── SEO METADATA ──────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await (prisma as any).blog.findUnique({
    where: { slug, published: true }
  })

  if (!post) return { title: "Post Not Found" }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt,
      type: "article",
      images: post.ogImage || post.image ? [{ url: post.ogImage || post.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt,
      images: post.ogImage || post.image ? [post.ogImage || post.image] : [],
    },
    alternates: {
      canonical: post.canonical || undefined, // Fallback handles undefined automatically
    }
  }
}

// ── COMPREHENSIVE MARKDOWN RENDERER ─────────────────────────
const renderMarkdown = (md: string) => {
  return md
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-xl font-black mt-8 mb-2 tracking-tight">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-2xl font-black mt-10 mb-4 tracking-tight">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-black mt-12 mb-6 text-primary tracking-tight">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-black mt-14 mb-8 tracking-tighter">$1</h1>')
    // Formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-white">$1</strong>')
    .replace(/_([^_]+)_/g, '<em class="italic text-white/90">$1</em>')
    .replace(/~~(.*?)~~/g, '<del class="text-muted-foreground/60">$1</del>')
    .replace(/==(.*?)==/g, '<mark class="bg-primary/20 text-primary px-1 rounded">$1</mark>')
    // Code
    .replace(/`([^`\n]+)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-card/40 backdrop-blur-md p-6 rounded-3xl overflow-x-auto text-sm my-8 border border-white/5 text-white/80 shadow-2xl"><code>$1</code></pre>')
    // Links & Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-[2rem] w-full max-h-[600px] object-cover my-12 shadow-2xl border border-white/5" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors" target="_blank" rel="noopener">$1</a>')
    // Quotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-6 py-2 italic text-muted-foreground/80 bg-primary/5 rounded-r-2xl my-8 text-xl">$1</blockquote>')
    // Lists & Checklists
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-start gap-3 mb-3"><div class="w-5 h-5 mt-1 shrink-0 rounded border border-white/20 bg-transparent flex justify-center items-center"></div> <span class="text-muted-foreground/90 leading-relaxed">$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-start gap-3 mb-3"><div class="w-5 h-5 mt-1 shrink-0 rounded border border-primary bg-primary text-background flex justify-center items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div> <span class="line-through text-muted-foreground/50 leading-relaxed">$1</span></div>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc mb-3 marker:text-primary leading-relaxed">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal mb-3 marker:text-primary leading-relaxed">$1</li>')
    // Divider
    .replace(/^---$/gm, '<hr class="border-white/5 my-14" />')
    // Tables (Basic)
    .replace(/\|(.+)\| \n\|([- |]+)\| \n((\|(.+)\| \n)+)/gm, '<div class="overflow-x-auto my-8"><table class="w-full text-left border-collapse"><thead><tr class="border-b border-white/10 text-muted-foreground text-sm uppercase tracking-widest bg-white/5">$1</tr></thead><tbody>$3</tbody></table></div>')
    // Paragraphs (Wrap orphan lines)
    .replace(/\n\n/g, '</p><p class="mb-6 leading-[1.8] text-lg text-muted-foreground/90 font-light">')
    .replace(/^(?!<(h|l|p|u|o|d|b|i|m|\/|t))([^<].+)$/gm, '<p class="mb-6 leading-[1.8] text-lg text-muted-foreground/90 font-light">$2</p>')
}

// ── SERVER COMPONENT ──────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await (prisma as any).blog.findUnique({
    where: { slug, published: true }
  })

  // Verify post exists
  if (!post) notFound()

  // Track view asynchronously (valid in Next.js Server Components if we don't await the result within the critical render path)
  ;(prisma as any).blog.update({
    where: { id: post.id },
    data: { views: { increment: 1 } }
  }).catch(() => {})

  // Fetch Related Posts
  const relatedPosts = await (prisma as any).blog.findMany({
    where: { published: true, id: { not: post.id } },
    take: 3,
    orderBy: { createdAt: "desc" }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            image: post.image ? [post.image] : [],
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            author: [{ "@type": "Organization", name: "ASTRAL AI", url: "https://astral.ai" }]
          })
        }}
      />
      
      <main className="relative holographic-grid pt-24 pb-24 px-8 min-h-screen bg-[#0c1324] font-manrope text-[#dce1fb] selection:bg-[#22d3ee] selection:text-[#005763]">

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 pointer-events-none opacity-20 font-mono text-[10px] text-[#8aebff] space-y-1 hidden lg:block">
          <p>NODE: {post.id.slice(-6).toUpperCase()}</p>
          <p>SYNC: 100%</p>
          <div className="w-24 h-px bg-[#8aebff]/30"></div>
        </div>

        <div className="absolute top-40 right-10 pointer-events-none opacity-20 font-mono text-[10px] text-[#d0bcff] text-right space-y-1 hidden lg:block">
          <p>CATEGORY: {post.category.toUpperCase()}</p>
          <p>LATENCY: 12ms</p>
          <div className="w-32 h-px bg-[#d0bcff]/30 ml-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            <article className="space-y-10">
              
              {/* Hero Section */}
              <div className="space-y-6 text-center pt-8">
                <div className="flex gap-3 justify-center mb-6">
                  <Link href="/blog" className="text-[#859397] hover:text-[#dce1fb] transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full"><ChevronLeft className="w-3 h-3" /> Back</Link>
                  <span className="bg-[#571bc1]/30 text-[#e9ddff] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md border border-[#d0bcff]/10">{post.category}</span>
                  <span className="text-[#859397] text-xs flex items-center gap-2"><Calendar className="w-3 h-3" /> {post.createdAt.toLocaleDateString()}</span>
                  <span className="text-[#859397] text-xs flex items-center gap-2"><Clock className="w-3 h-3" /> {post.readTime} min read</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#dce1fb] leading-tight mx-auto max-w-3xl">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-[#bbc9cd] leading-relaxed max-w-2xl mx-auto mt-6">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Main Image Card */}
              {post.image && (
                <div className="relative group overflow-hidden rounded-xl bg-[#23293c] p-1 mt-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8aebff]/20 to-[#d0bcff]/20 opacity-50"></div>
                  <img src={post.image} alt={post.title} className="w-full h-[300px] md:h-[600px] object-cover rounded-lg" />
                  <div className="absolute bottom-6 left-6 flex gap-4">
                    <div className="bg-[#0c1324]/80 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/10 text-[10px] font-mono text-[#8aebff]">
                      RECT_ID: {post.id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Card with Shimmer */}
              <div className="shimmer bg-[#151b2d]/40 border border-white/5 rounded-xl p-8 md:p-12 space-y-8 backdrop-blur-md prose prose-invert prose-lg max-w-none prose-p:text-lg prose-p:text-[#dce1fb] prose-p:leading-relaxed mx-auto prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tight prose-blockquote:border-l-4 prose-blockquote:border-[#8aebff] prose-blockquote:pl-8 prose-blockquote:py-6 prose-blockquote:my-10 prose-blockquote:bg-[#8aebff]/5 prose-blockquote:rounded-r-xl">
                 <div dangerouslySetInnerHTML={{ 
                    __html: filterXSS(renderMarkdown(post.content), {
                      whiteList: {
                        ...getDefaultWhiteList(),
                        span: ["class"],
                        div: ["class"],
                        blockquote: ["class"],
                        mark: ["class"],
                        code: ["class"],
                        pre: ["class"],
                        h1: ["class"],
                        h2: ["class"],
                        h3: ["class"],
                        h4: ["class"],
                        li: ["class"],
                        hr: ["class"],
                      }
                    }) 
                 }} />
              </div>

              {/* Interactions Component Wrapper */}
              <BlogInteractions postId={post.id} />

            </article>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
              <section className="space-y-10 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-[#3c494c]">Continue the Journey</h4>
                  <Link href="/blog" className="text-xs font-bold text-[#8aebff] hover:underline">View All Archives</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((rPost: any) => (
                    <Link key={rPost.id} href={`/blog/${rPost.slug}`} className="group glass-panel rounded-2xl overflow-hidden hover:border-[#8aebff]/30 transition-all border border-white/5 flex flex-col">
                      {/* Image */}
                      <div className="aspect-video w-full overflow-hidden bg-[#151b2d] shrink-0">
                        {rPost.image ? (
                          <img
                            src={rPost.image}
                            alt={rPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#8aebff]/10 to-[#d0bcff]/10 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8aebff]/40">{rPost.category}</span>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-5 space-y-3 flex flex-col flex-grow">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#8aebff]/60">{rPost.category}</span>
                        <h5 className="font-bold text-[#dce1fb] line-clamp-2 leading-snug">{rPost.title}</h5>
                        <p className="text-xs text-[#bbc9cd] leading-relaxed line-clamp-2 flex-grow">{rPost.excerpt}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#859397] group-hover:text-[#8aebff] transition-colors pt-1">
                          READ POST <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </main>
    </>
  )
}
