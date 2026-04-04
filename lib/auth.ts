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

import { dispatchNotification } from "@/services/notifications.service"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
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
        token.role = (user as any).role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id
        session.user.role = token.role

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
        } catch (_) {}
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      try {
        const { headers } = await import("next/headers")
        const headerList = headers()
        const userAgent = (await headerList).get("user-agent") || ""
        const ip = (await headerList).get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
        const device = userAgent.toLowerCase().includes("mobile") ? "Mobile" : "Desktop"

        if (user?.id) {
          // Check for previous logins on this device
          const previousLogin = await prisma.loginHistory.findFirst({
            where: { userId: user.id, device }
          })

          await prisma.loginHistory.create({
            data: { userId: user.id, ip, device }
          })

          if (!previousLogin) {
            // SECURITY ALERT: First time on this device
            await dispatchNotification("SECURITY_ALERT", {
              userId: user.id,
              data: { details: `New ${device} detected - IP: ${ip}` }
            })
          } else {
            // NOTIFY: Standard Login Success
            await dispatchNotification("USER_LOGIN", {
              userId: user.id,
              data: { device, ip }
            })
          }
        }
      } catch (err) {
        console.error("[SECURITY_LAYER_ERROR]:", err)
      }
    },
    async createUser({ user }: { user: any }) {
      try {
        const { cookies } = await import("next/headers")
        const cookieStore = cookies()
        const referrerId = (await cookieStore).get("astral_ref_id")?.value

        // Initialize Notification Settings
        await prisma.notificationSettings.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id }
        })

        // Dispatch Welcome Notification
        await dispatchNotification("USER_SIGNUP", {
          userId: user.id,
          data: { name: user.name }
        })

        if (referrerId && user.id) {
          // Referral Reward
          const referrer = await prisma.user.findUnique({ where: { id: referrerId } })
          if (referrer) {
             await prisma.user.update({
                where: { id: referrerId },
                data: { credits: { increment: 5 } }
             })
             
             // Log credit change (this handles notifying the referrer)
             const { logCreditChange } = await import("@/services/credits.service")
             await logCreditChange(null, referrerId, 5, "REWARD", `Referral Reward - Seeker ${user.name || 'Anonymous'} joined`)
          }
        }
      } catch (err) {
        console.error("[SOCIAL_SIGNUP_EVENT_ERROR]:", err)
      }
    }
  }
}


import { getServerSession } from "next-auth/next"
export const getServerAuthSession = () => getServerSession(authOptions)
