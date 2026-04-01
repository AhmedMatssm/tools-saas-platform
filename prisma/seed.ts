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

    // ── 3. AUDIT LOG (Security Requirement) ───────────────
    await prisma.auditLog.create({
      data: {
        action: "ADMIN_SEED_EXECUTION",
        userId: admin.id,
        entity: "USER",
        details: `Successfully upserted admin user: ${adminEmail}`,
      },
    })

    console.log("--------------------------------------------------")
    console.log("✨ ASTRAL SUPREME ADMINISTRATOR MANIFESTED")
    console.log(`Email:    ${admin.email}`)
    console.log("Status:   ACTIVE / SECURE")
    console.log("Note:     Credentials managed via .env")
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
