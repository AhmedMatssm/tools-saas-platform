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
        // We avoid fetching from DB here to save connections.
        // Data is maintained via JWT callback above.
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      // Non-blocking side effects: security logging & notifications
      try {
        if (!user?.id) return

        // 1. Log History
        await prisma.loginHistory.create({
          data: { 
            userId: user.id, 
            ip: "Remote", // Simplified to avoid headers() dependency in event
            device: "System" 
          }
        }).catch(() => {})

        // 2. Dispatch Success Notification
        await dispatchNotification("USER_LOGIN", {
          userId: user.id,
          data: { device: "Identity Manifested", ip: "Authenticated" }
        }).catch(() => {})

      } catch (err) {
        // Silent fail: login events shouldn't break the actual login flow
        console.warn("[AUTH_EVENT_SILENT_FAIL]:", err)
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
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
}


import { getServerSession } from "next-auth/next"
export const getServerAuthSession = () => getServerSession(authOptions)
