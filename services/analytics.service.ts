import prisma from "@/lib/prisma"
import redis from "@/lib/redis"
import { createHash } from "crypto"

/**
 * Privacy-first visitor tracking.
 * Hashes the IP address with a secret salt to avoid storing raw PII.
 */
export function hashIP(ip: string): string {
  const salt = process.env.ANALYTICS_SALT || "astral_spectral_salt_2024"
  return createHash("sha256").update(ip + salt).digest("hex")
}

/**
 * LOW IMPACT: Buffers the visit in Redis instead of hitting Postgres directly.
 * Decouples the request lifecycle from database connection availability.
 */
export async function trackVisitorBuffered(ip: string, userAgent: string | null, path: string) {
  try {
    const ipHash = hashIP(ip)
    const payload = JSON.stringify({
      ipHash,
      userAgent: userAgent?.substring(0, 255) || "Unknown",
      path: path.substring(0, 255),
      timestamp: new Date().toISOString()
    })

    // Fast path: Push to Redis list for later batch processing
    await redis.rpush("analytics:hits", payload)
    
    // Increment a total hit counter for instant dashboard stats (optional)
    await redis.incr(`analytics:hits:total`)

  } catch (error) {
    console.error("[ANALYTICS_BUFFER_ERROR]:", error)
  }
}

/**
 * BATCH SYNC: Moves hits from Redis to PostgreSQL.
 * Designed to run in a Cron job (e.g. every 10 min).
 */
export async function syncRedisAnalyticsToDB() {
  const BATCH_SIZE = 100
  let processedCount = 0

  try {
    // Get a chunk of hits from Redis
    const hits = await redis.lpop("analytics:hits", BATCH_SIZE)
    if (!hits || hits.length === 0) return 0

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    for (const h of hits) {
      const data = JSON.parse(h)
      
      try {
        // Use a transaction or careful sequence to ensure consistency
        // 1. Find or Create Visitor
        let visitor = await (prisma as any).visitor.findFirst({
          where: {
            ipHash: data.ipHash,
            createdAt: { gte: twentyFourHoursAgo }
          }
        })

        if (!visitor) {
          visitor = await (prisma as any).visitor.create({
            data: {
              ipHash: data.ipHash,
              userAgent: data.userAgent
            }
          })
        }

        // 2. Log Page View
        await (prisma as any).pageView.create({
          data: {
            visitorId: visitor.id,
            path: data.path,
            createdAt: new Date(data.timestamp)
          }
        })
        
        processedCount++
      } catch (err) {
        console.error("[ANALYTICS_SYNC_ITEM_ERROR]:", err)
      }
    }
    // 3. Process Blog Views (Hash)
    const viewMap = await redis.hgetall("analytics:blog_views")
    const slugs = Object.keys(viewMap)

    for (const slug of slugs) {
      const increment = parseInt(viewMap[slug])
      if (increment > 0) {
        try {
          await (prisma as any).blog.update({
            where: { slug },
            data: { views: { increment } }
          })
          // Remove from Redis after successful sync
          await redis.hdel("analytics:blog_views", slug)
          processedCount++
        } catch (err) {
          console.error(`[BLOG_SYNC_FAIL] Slug: ${slug}`, err)
        }
      }
    }

  } catch (error) {
    console.error("[ANALYTICS_SYNC_GLOBAL_ERROR]:", error)
  }

  return processedCount
}

/**
 * BUFFERED: Increments blog view counts via Redis to save DB connections.
 */
export async function bufferBlogView(slug: string) {
  try {
    await redis.hincrby("analytics:blog_views", slug, 1)
  } catch (error) {
    console.error("[BLOG_VIEW_BUFFER_ERROR]:", error)
  }
}

/**
 * LEGACY/DIRECT: Kept for fallback but not recommended for high traffic on Vercel.
 */
export async function trackVisitorDirect(ip: string, userAgent: string | null, path: string) {
  try {
    const ipHash = hashIP(ip)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    let visitor = await (prisma as any).visitor.findFirst({
      where: { ipHash, createdAt: { gte: twentyFourHoursAgo } }
    })

    if (!visitor) {
      visitor = await (prisma as any).visitor.create({
        data: { ipHash, userAgent: userAgent?.substring(0, 255) || "Unknown" }
      })
    }

    await (prisma as any).pageView.create({
      data: { visitorId: visitor.id, path: path.substring(0, 255) }
    })
  } catch (error) {
    console.error("[ANALYTICS_TRACKING_ERROR]:", error)
  }
}
