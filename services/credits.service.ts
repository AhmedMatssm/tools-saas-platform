import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

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

    console.log(`[CREDIT_LOG] ${type}: ${amount} for user ${userId}`)
  } catch (error) {
    console.error("[CREDIT_LOG_ERROR]:", error)
  }
}

