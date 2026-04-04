import { Worker, Job } from "bullmq"
import IORedis from "ioredis"
import { PrismaClient } from "@prisma/client"
import Pusher from "pusher"

// We instantiate dependencies here for standalone worker execution
const prisma = new PrismaClient()
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "",
  useTLS: true,
})

console.log("🚀 [ASTRAL_WORKER]: Initializing Spectral Notification Processor...")

const worker = new Worker(
  "notifications",
  async (job: Job) => {
    const { userId, title, message, type, metadata } = job.data

    console.log(`[JOB_${job.id}]: Processing ${type} for user ${userId}`)

    // 1. Fetch User Preferences
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    })

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId }
      })
    }

    // 2. Check Type Enforcement
    const typeMapping: Record<string, keyof typeof settings> = {
      SUCCESS: "successEnabled",
      ERROR: "errorEnabled",
      WARNING: "warningEnabled",
      CREDIT: "creditEnabled",
      SYSTEM: "systemEnabled",
      INFO: "systemEnabled" // Fallback
    }

    const typeField = typeMapping[type as keyof typeof typeMapping] || "systemEnabled"
    const isTypeEnabled = settings[typeField as keyof typeof settings]
    const eventType = metadata?.eventType || "MANUAL"

    if (!isTypeEnabled) {
       console.log(`[NOTIFY] user=${userId} event=${eventType} status=SKIPPED_TYPE reason=${type}_disabled`)
       return
    }

    // 3. Persist to Database (In-App)
    let notification = null
    if (settings.inAppEnabled) {
      notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          metadata: metadata || {},
        }
      })
      console.log(`[NOTIFY] user=${userId} event=${eventType} status=SAVED_TO_DB`)
    } else {
      console.log(`[NOTIFY] user=${userId} event=${eventType} status=SKIPPED_INAPP reason=channel_disabled`)
    }

    // 4. Trigger Real-Time (Pusher)
    try {
      if (settings.inAppEnabled && notification && process.env.PUSHER_KEY) {
        await pusherServer.trigger(`private-user-${userId}`, "notification:new", notification)
        console.log(`[NOTIFY] user=${userId} event=${eventType} status=DISPATCHED_REALTIME`)
      }
    } catch (err) {
      console.error(`[NOTIFY] user=${userId} status=REALTIME_FAILURE:`, err)
    }

    // 5. Send Email if enabled
    if (settings.emailEnabled) {
       const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
       })

       if (user?.email) {
          const { sendEmail } = await import("../lib/mail")
          console.log(`[NOTIFY] user=${userId} event=${eventType} status=SENDING_EMAIL`)
          
          await sendEmail({
            to: user.email,
            subject: title,
            text: message,
            html: `
              <div style="font-family: sans-serif; padding: 20px; background: #020617; color: white;">
                <h1 style="color: #3b82f6;">${title}</h1>
                <p>${message}</p>
                ${metadata?.resetUrl ? `
                  <div style="margin-top: 30px;">
                    <a href="${metadata.resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                      Manifest New Password
                    </a>
                  </div>
                  <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
                    If the button above does not work, copy and paste this URL into your browser: <br />
                    ${metadata.resetUrl}
                  </p>
                ` : ""}
                <p style="margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b;">
                  &copy; 2026 ASTRAL AI Network. All rights reserved.
                </p>
              </div>
            `
          })
          console.log(`[NOTIFY] user=${userId} event=${eventType} status=EMAIL_DISPATCHED`)
       }
    }


  },
  { 
    connection,
    concurrency: 10 // Process 10 jobs concurrently
  }
)

worker.on("completed", (job) => {
  console.log(`✅ [JOB_${job.id}]: Manifestation complete.`)
})

worker.on("failed", (job, err) => {
  console.error(`❌ [JOB_${job?.id}]: Dissipated with error: ${err.message}`)
})

process.on("SIGTERM", async () => {
  console.log("Stopping worker...")
  await worker.close()
})
