import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // ── 1. VALIDATION ────────────────────────────────────
  if (!adminEmail || !adminPassword) {
    console.error("❌ SKIPPING ADMIN CREATION: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env")
    return
  }

  console.log("🌱 SEEDING: Creating/Updating ASTRAL Administrator...")

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // ── 2. UPSERT ADMIN ───────────────────────────────────
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        password: hashedPassword,
      },
      create: {
        name: "Supreme Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        credits: 99999, // Admins get nearly unlimited power
      },
    })

    console.log("--------------------------------------------------")
    console.log("✨ ASTRAL SUPREME ADMINISTRATOR MANIFESTED")
    console.log(`Email:    ${admin.email}`)
    console.log("Status:   ACTIVE / SECURE")
    
    // ── 3. SEED ANALYTICS (Real data proxy) ────────────────
    console.log("📊 SEEDING: Generating historical session activity...")
    
    const today = new Date()
    for (let i = 0; i < 7; i++) {
       const date = new Date()
       date.setDate(today.getDate() - i)
       
       // Create 3-7 logins per day for the admin
       const loginsToCreate = Math.floor(Math.random() * 5) + 3
       for (let j = 0; j < loginsToCreate; j++) {
          await prisma.loginHistory.create({
            data: {
              userId: admin.id,
              ip: `127.0.0.${Math.floor(Math.random() * 255)}`,
              device: Math.random() > 0.3 ? "Desktop" : "Mobile",
              createdAt: date
            }
          })
       }
    }

    // Ensure usage record exists
    await prisma.usage.upsert({
      where: { userId: admin.id },
      update: {},
      create: { userId: admin.id, count: 42 }
    })

    console.log("✨ PLATFORM ANALYTICS SYNCHRONIZED")
    console.log("--------------------------------------------------")

  } catch (error) {
    console.error("❌ ADMIN_SEED_FAILED:", error instanceof Error ? error.message : error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
