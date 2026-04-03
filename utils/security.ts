/**
 * Lightweight in-memory rate limiter for API routes.
 * For production, replace with Redis-backed solution (Upstash, etc.)
 * 
 * Usage:
 *   const { allowed, remaining } = rateLimit(identifier, { max: 10, windowMs: 60_000 })
 *   if (!allowed) return Response.json({ error: "Too many requests" }, { status: 429 })
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

// In-memory store (per-process, resets on server restart)
const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  store.forEach((v, k) => { if (v.resetAt < now) store.delete(k) })
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /** Maximum requests allowed in the time window */
  max: number
  /** Time window in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || entry.resetAt < now) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + options.windowMs,
    }
    store.set(identifier, newEntry)
    return { allowed: true, remaining: options.max - 1, resetAt: newEntry.resetAt }
  }

  entry.count++

  if (entry.count > options.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: options.max - entry.count, resetAt: entry.resetAt }
}

/**
 * Sanitize user input: strip HTML tags, trim whitespace, normalize spaces.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")     // strip HTML
    .replace(/[^\x20-\x7E\u00C0-\u024F\s]/g, "") // strip non-printable
    .trim()
    .replace(/\s+/g, " ")         // normalize spaces
}
