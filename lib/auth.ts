import type { NextAuthOptions, DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MANIFESTATION_DENIED: Missing spectral fields.")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("MANIFESTATION_DENIED: Ghost identity not found.")
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordMatch) {
          throw new Error("MANIFESTATION_DENIED: Incorrect spectral key.")
        }

        return user
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id
        session.user.role = token.role

        // ── Always fetch fresh user data from DB ────────────
        // JWT strategy caches data in the token, so profile
        // updates wouldn't reflect without this DB lookup.
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { name: true, email: true, role: true }
          })
          if (freshUser) {
            session.user.name = freshUser.name
            session.user.email = freshUser.email
            session.user.role = freshUser.role
          }
        } catch (_) {
          // Fall back to token values if DB is unreachable
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      // ── Session Manifestation Logging ───────────────
      try {
        const { headers } = await import("next/headers")
        const headerList = headers()
        const userAgent = (await headerList).get("user-agent") || ""
        const ip = (await headerList).get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
        const device = userAgent.toLowerCase().includes("mobile") ? "Mobile" : "Desktop"

        if (user?.id) {
          await prisma.loginHistory.create({
            data: {
              userId: user.id,
              ip,
              device
            }
          })
          console.log(`[LOGIN_EVENT] Spectral session recorded for ${user.email} (${device})`)
        }
      } catch (err) {
        console.error("[LOGIN_EVENT_ERROR]:", err)
      }
    },
    async createUser({ user }: { user: any }) {
      // ── Social Signup Referral Processing ───────────────
      // Catch referrals for Google/Github seekers
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = cookies()
        const referrerId = (await cookieStore).get("astral_ref_id")?.value

        if (referrerId && user.id) {
          console.log(`[SOCIAL_REFERRAL] New seeker ${user.email} joined via ${referrerId}`)

          await prisma.user.update({
            where: { id: referrerId },
            data: { credits: { increment: 5 } }
          })

          console.log(`[SOCIAL_REFERRAL] Successfully awarded +5 Aura to referrer: ${referrerId}`)
        }
      } catch (err) {
        console.error("[SOCIAL_REFERRAL_ERROR]:", err)
      }
    }
  }
}

import { getServerSession } from "next-auth/next"
export const getServerAuthSession = () => getServerSession(authOptions)
