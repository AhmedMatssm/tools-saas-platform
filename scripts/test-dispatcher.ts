import { dispatchNotification, dispatchMany } from "../lib/notifications"
import prisma from "../lib/prisma"

async function testDispatcher() {
  const TEST_EMAIL = "admin@astral.ai"
  const user = await prisma.user.findFirst({ where: { email: TEST_EMAIL } })
  
  if (!user) {
    console.error("Test user not found.")
    return
  }

  console.log("🚀 Testing Unified Dispatcher...")

  // 1. Test USER_SIGNUP
  console.log("   - Dispatching USER_SIGNUP...")
  await dispatchNotification("USER_SIGNUP", {
    userId: user.id,
    data: { name: user.name }
  })

  // 2. Test CREDIT_ADDED
  console.log("   - Dispatching CREDIT_ADDED...")
  await dispatchNotification("CREDIT_ADDED", {
    userId: user.id,
    data: { amount: 50, description: "Monthly Refill" }
  })

  // 3. Test ADMIN_BROADCAST (Single)
  console.log("   - Dispatching ADMIN_BROADCAST...")
  await dispatchNotification("ADMIN_BROADCAST", {
    userId: user.id,
    data: { title: "Urgent Update", message: "Spectral servers are ascending." }
  })

  // 4. Test Batch Dispatch
  console.log("   - Dispatching BATCH SYSTEM_UPDATE...")
  await dispatchMany([user.id], "SYSTEM_UPDATE")

  console.log("✅ Dispatch tests enqueued. Check worker logs.")
}

testDispatcher().catch(console.error)
