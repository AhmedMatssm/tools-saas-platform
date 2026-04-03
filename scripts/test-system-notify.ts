import { PrismaClient } from "@prisma/client"
import { notifyUser } from "../lib/notifications"

const prisma = new PrismaClient()

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testScenario(name: string, userId: string, update: any, notification: any, shouldPersist: boolean) {
  console.log(`\n🧪 SCENARIO: ${name}`)
  
  // 1. Update settings
  console.log(`   - Updating settings for ${userId}...`)
  await prisma.notificationSettings.update({
    where: { userId },
    data: update
  })

  // 2. Count current notifications for this user
  const beforeCount = await prisma.notification.count({ where: { userId } })

  // 3. Trigger notification
  console.log(`   - Enqueueing ${notification.type} notification...`)
  await notifyUser({ userId, ...notification })

  // 4. Wait for worker to process (BullMQ + Worker overhead)
  console.log(`   - Waiting for worker...`)
  await sleep(2000)

  // 5. Verify persistence
  const afterCount = await prisma.notification.count({ where: { userId } })
  const diff = afterCount - beforeCount

  if (shouldPersist && diff === 1) {
    console.log(`   ✅ SUCCESS: Notification persisted correctly.`)
  } else if (!shouldPersist && diff === 0) {
    console.log(`   ✅ SUCCESS: Notification correctly skipped.`)
  } else {
    console.error(`   ❌ FAILURE: Expected diff ${shouldPersist ? 1 : 0}, got ${diff}.`)
  }
}

async function runTests() {
  const user = await prisma.user.findFirst({ where: { email: "admin@astral.ai" } })
  if (!user) {
    console.error("❌ Admin user not found. Please run seed first.")
    return
  }

  const userId = user.id

  // Scenario 1: Everything enabled
  await testScenario("Enable Everything", userId, {
    inAppEnabled: true, emailEnabled: true, successEnabled: true, creditEnabled: true, systemEnabled: true
  }, {
    title: "All Systems Go", message: "Testing with all flags high.", type: "SUCCESS"
  }, true)

  // Scenario 2: Disable In-App delivery
  await testScenario("Disable In-App Channel", userId, {
    inAppEnabled: false
  }, {
    title: "Invisible Echo", message: "This should not be saved in DB.", type: "SUCCESS"
  }, false)

  // Scenario 3: Disable specific type (CREDIT)
  await testScenario("Disable CREDIT type specifically", userId, {
    inAppEnabled: true, creditEnabled: false
  }, {
    title: "Ghost Credits", message: "This should be skipped because CREDIT is disabled.", type: "CREDIT"
  }, false)

  // Scenario 4: Re-enable and verify
  await testScenario("Re-enable and Verify", userId, {
    inAppEnabled: true, creditEnabled: true
  }, {
    title: "Resonant Balance", message: "Credits enabled again.", type: "CREDIT"
  }, true)

  console.log("\n🏁 Comprehensive Testing Manifest Complete.")
  process.exit(0)
}

runTests().catch(err => {
  console.error("❌ Critical Test Failure:", err)
  process.exit(1)
})
