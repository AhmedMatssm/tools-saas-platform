import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { notifyUser } from "./notifications.service"

export type CreditType = "REWARD" | "USAGE" | "REFILL" | "PURCHASE" | "ADMIN"

export async function logCreditChange(
  tx: Prisma.TransactionClient | typeof prisma | null, 
  userId: string, 
  amount: number, 
  type: CreditType, 
  description?: string
) {
  try {
    const client = tx || prisma
    
    await client.creditHistory.create({
      data: {
        userId,
        amount,
        type,
        description
      }
    })

    // ── INTEGRATED NOTIFICATION ─────────────────────────
    const event = amount > 0 ? "CREDIT_ADDED" : "CREDIT_DEDUCTED"
    const payload = {
      userId,
      data: {
        amount: Math.abs(amount),
        type,
        description: description || "Balance update"
      }
    }
    
    // Check if it's a referral reward
    if (type === "REWARD" && description?.toLowerCase().includes("referral")) {
      await (import("./notifications.service")).then(({ dispatchNotification }) => 
        dispatchNotification("REFERRAL_REWARD", payload)
      )
    } else {
      await (import("./notifications.service")).then(({ dispatchNotification }) => 
        dispatchNotification(event, payload)
      )
    }

    console.log(`[CREDIT_LOG] ${type}: ${amount} for user ${userId}`)
  } catch (error) {
    console.error("[CREDIT_LOG_ERROR]:", error)
  }
}

