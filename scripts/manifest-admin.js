const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

/**
 * ── 1. SECURITY & CONFIG ────────────────────────────────
 * All credentials are now managed via environment variables.
 * Secure Password Hashing (Salt Rounds: 12)
 */

async function manifestAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // ── 2. VALIDATION (Prevention of Missing Secrets) ───────
  if (!adminEmail || !adminPassword) {
    console.error("❌ ABORTING: Environment variables ADMIN_EMAIL or ADMIN_PASSWORD are missing.")
    process.exit(1)
  }

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // ── 3. UPSERT STRATEGY (Avoid Duplicates) ───────────────
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
      },
    })

    // ── 4. AUDIT TRAIL ──────────────────────────────────────
    await prisma.auditLog.create({
      data: {
        action: "CLI_ADMIN_MANIFESTATION",
        userId: admin.id,
        entity: "USER",
        details: `Administrator manifest confirmed via CLI script: ${adminEmail}`,
      },
    })

    console.log("--------------------------------------------------")
    console.log("🛠️  ASTRAL ADMIN MANIFESTATION: SUCCESS")
    console.log("--------------------------------------------------")
    console.log(`Email:    ${admin.email}`)
    console.log("Audit:    Logged in shadow manifest") // audit log
    console.log("Security: Refactor successful - no passwords logged")
    console.log("--------------------------------------------------")

  } catch (error) {
    console.error("❌ CRITICAL_ERROR:", error instanceof Error ? error.message : "Undefined failure during manifest.")
  } finally {
    await prisma.$disconnect()
  }
}

manifestAdmin()
