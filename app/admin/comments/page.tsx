import { revalidatePath } from "next/cache"
import { Button } from "@/components/common/button"
import prisma from "@/lib/prisma"

// ── SECURITY: ENSURE PAGE IS DYNAMIC AT RUNTIME ────────────────
export const dynamic = "force-dynamic"

export default async function AdminCommentsPage() {
  const comments = await (prisma as any).comment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      parent: { select: { content: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-black">Comment Moderation</h1>
      <p className="text-muted-foreground">Approve, reject, or delete blog comments.</p>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4 w-1/4">User</th>
              <th className="p-4 w-1/2">Content</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {comments.map((c: any) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="p-4">
                  <p className="font-bold">{c.user?.name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{c.user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                  <p className="whitespace-pre-wrap">{c.content}</p>
                  {c.parent && (
                    <div className="mt-2 pl-2 border-l-2 border-primary/50 text-xs text-muted-foreground line-clamp-2">
                      Replied to: {c.parent.content}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Post ID: {c.postId.slice(0, 8)}...</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${c.status === "APPROVED" ? "bg-green-500/20 text-green-500" : c.status === "REJECTED" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <form className="inline-block" action={async () => {
                    "use server"
                    await (prisma as any).comment.update({ where: { id: c.id }, data: { status: "APPROVED" }})
                    revalidatePath("/admin/comments")
                  }}>
                    <Button size="sm" variant="outline" className="text-green-500 border-green-500/20 hover:bg-green-500/10">Approve</Button>
                  </form>
                  <form className="inline-block" action={async () => {
                    "use server"
                    await (prisma as any).comment.update({ where: { id: c.id }, data: { status: "REJECTED" }})
                    revalidatePath("/admin/comments")
                  }}>
                    <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10">Reject</Button>
                  </form>
                  <form className="inline-block" action={async () => {
                    "use server"
                    await (prisma as any).comment.delete({ where: { id: c.id }})
                    revalidatePath("/admin/comments")
                  }}>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10">Delete</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
