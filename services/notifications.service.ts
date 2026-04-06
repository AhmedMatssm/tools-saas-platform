import prisma from "@/lib/prisma"
import { notificationQueue } from "@/lib/bullmq"
import { pusherServer } from "@/lib/pusher"

/**
 * PRODUCTION-READY NOTIFICATION SERVICE
 * Handles creation, delivery, and lifecycle of notifications.
 */

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CREDIT" | "SYSTEM"
  metadata?: any
}

// ── EVENT-DRIVEN ARCHITECTURE (CENTRALIZED) ───────────────────────────

export type NotificationEvent =
  | "USER_SIGNUP"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "CREDIT_ADDED"
  | "CREDIT_DEDUCTED"
  | "REFERRAL_REWARD"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "ADMIN_BROADCAST"
  | "SYSTEM_UPDATE"
  | "ERROR_OCCURRED"
  | "SECURITY_ALERT"
  | "PASSWORD_RESET"

interface EventPayload {
  userId: string
  data?: Record<string, any>
  metadata?: any
}


/**
 * Shared Template Resolver
 */
function resolveTemplate(event: NotificationEvent, data?: Record<string, any>) {
  let title = ""
  let message = ""
  let type: CreateNotificationParams["type"] = "INFO"

  switch (event) {
    case "USER_SIGNUP":
      title = "Welcome Seeker"
      message = `Welcome to Astral ${data?.name || ""}. Your manifestation journey begins now.`
      type = "SUCCESS"
      break
    case "USER_LOGIN":
      title = "Successful Manifestation"
      message = `New login detected from ${data?.device || "Unknown Device"} - IP: ${data?.ip || "Unknown"}.`
      type = "SUCCESS"
      break
    case "CREDIT_ADDED":
      title = "Credits Manifested"
      message = `${data?.description || "Balance increase"}: +${data?.amount || 0} credits.`
      type = "CREDIT"
      break
    case "CREDIT_DEDUCTED":
      title = "Consumption Recorded"
      message = `${data?.description || "Balance update"}: -${data?.amount || 0} credits.`
      type = "CREDIT"
      break
    case "REFERRAL_REWARD":
      title = "Referral Reward Granted"
      message = `A new seeker followed your lead. +${data?.amount || 5} credits added to your aura.`
      type = "CREDIT"
      break
    case "PAYMENT_SUCCESS":
      title = "Payment Manifested"
      message = `Your transaction was successful. Entity: ${data?.entityId || "N/A"}.`
      type = "SUCCESS"
      break
    case "PAYMENT_FAILED":
      title = "Manifestation Failure"
      message = `The financial resonance failed. Please check your payment source.`
      type = "ERROR"
      break
    case "ADMIN_BROADCAST":
      title = data?.title || "System Announcement"
      message = data?.message || "Important update from the architects."
      type = "SYSTEM"
      break
    case "SYSTEM_UPDATE":
      title = "System Ascension"
      message = `We have implemented new spectral features. Check out the latest changelog.`
      type = "SYSTEM"
      break
    case "ERROR_OCCURRED":
      title = "Critical Intersection"
      message = `An error occurred in your current session: ${data?.error || "Unknown"}.`
      type = "ERROR"
      break
    case "SECURITY_ALERT":
      title = "Security Alert"
      message = `Potential spectral interference detected: ${data?.details || "Unknown behavior"}.`
      type = "WARNING"
      break
    case "PASSWORD_RESET":
      title = "Recovery Link"
      message = `A secure password reset link was dispatched to your email. It expires in 1 hour.`
      type = "INFO"
      break
    default:
      title = "Notification"
      message = "You have a new update."
      type = "INFO"
  }

  return { title, message, type }
}

/**
 * Main Dispatcher: Maps high-level app events to structured notifications.
 * This is the primary entry point for all system-generated notifications.
 */
export async function dispatchNotification(event: NotificationEvent, payload: EventPayload) {
  const { userId, data, metadata } = payload
  const { title, message, type } = resolveTemplate(event, data)

  // Enqueue via standard queue logic
  return await notifyUser({
    userId,
    title,
    message,
    type,
    metadata: { ...metadata, ...data, eventType: event }
  })
}


/**
 * Batch Dispatcher: Sends the same event to multiple users.
 * Ideal for broadcasts, updates, or team-wide alerts.
 */
export async function dispatchMany(userIds: string[], event: NotificationEvent, sharedData?: Record<string, any>) {
  const { title, message, type } = resolveTemplate(event, sharedData)
  
  const jobs = userIds.map((userId) => ({
    name: "process-notification",
    data: {
      userId,
      title,
      message,
      type,
      metadata: { ...sharedData, eventType: event }
    },
  }))
  
  await notificationQueue.addBulk(jobs)
}


/**
 * Enqueue notification creation as a background job for maximum performance.
 */
export async function notifyUser(params: CreateNotificationParams) {
  try {
    // We enqueue the creation task to ensure the request is non-blocking.
    await notificationQueue.add("process-notification", params)
    return { success: true }
  } catch (error) {
    console.error("[NOTIFICATION_QUEUE_ERROR]:", error)
    // Fallback: create directly if queue fails (optional, based on priority)
    return { success: false, error }
  }
}

/**
 * Bulk notification helper
 */
export async function notifyMany(userIds: string[], params: Omit<CreateNotificationParams, "userId">) {
  const jobs = userIds.map((userId) => ({
    name: "process-notification",
    data: { ...params, userId },
  }))
  await notificationQueue.addBulk(jobs)
}

/**
 * Core Creation Logic (called by worker)
 * This is the source of truth for whether a notification should be created.
 */
export async function createNotificationSync(params: CreateNotificationParams) {
  const { userId, title, message, type, metadata } = params

  // 1. Fetch User Preferences
  let settings = await prisma.notificationSettings.findUnique({
    where: { userId }
  })

  // Create default settings if not exists
  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: { userId }
    })
  }

  // 2. Map types to setting fields
  const typeMapping: Record<string, keyof typeof settings> = {
    SUCCESS: "successEnabled",
    ERROR: "errorEnabled",
    WARNING: "warningEnabled",
    CREDIT: "creditEnabled",
    SYSTEM: "systemEnabled",
    INFO: "systemEnabled" // Use systemEnabled as fallback for INFO
  }

  const typeField = typeMapping[type] || "systemEnabled"
  const isTypeEnabled = settings[typeField as keyof typeof settings] as boolean

  // 3. Respect user preferences (In-App)
  let notification = null
  if (settings.inAppEnabled && isTypeEnabled) {
    notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata || {},
      }
    })

    // 4. Real-Time Delivery
    try {
      if (process.env.PUSHER_KEY) {
        await pusherServer.trigger(`private-user-${userId}`, "notification:new", notification)
      }
    } catch (error) {
      console.error("[REALTIME_DELIVERY_FAILURE]:", error)
    }
  }

  // 5. External Delivery (E.g. Email)
  if (settings.emailEnabled && isTypeEnabled) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (user?.email) {
      // Lazy load mailer to avoid cold-start delay
      const { sendEmail } = await import("@/services/mail.service")

      // Use the resolved template details
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
    }
  }

  return notification
}


export async function markAsRead(notificationId: string, userId: string) {
  return await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true }
  })
}

export async function markAllAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  })
}

export async function deleteNotification(notificationId: string, userId: string) {
  return await prisma.notification.delete({
    where: { id: notificationId, userId }
  })
}


