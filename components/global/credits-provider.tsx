"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"

export interface UserCreditsData {
  credits: number
  lastRefill: string
  lastClaim: string
  plan: string
  totalGenerations: number
}

export interface UseCreditsReturn {
  credits: number | null
  userData: UserCreditsData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const CreditsContext = createContext<UseCreditsReturn | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserCreditsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (status !== "authenticated") return
    
    setIsLoading(true)
    setError(null)
    try {
      const resp = await axios.get("/api/user")
      if (resp.data.success) {
        const u = resp.data.user
        setUserData({
          credits: u.credits,
          lastRefill: u.lastRefill,
          lastClaim: u.lastClaim,
          plan: u.plan,
          totalGenerations: u._count?.generations ?? 0,
        })
      }
    } catch (err: any) {
      setError("Failed to load credits")
      console.error("USE_CREDITS_PROVIDER_ERROR:", err)
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => { 
    if (status === "authenticated") {
      refetch() 
    } else if (status === "unauthenticated") {
      setUserData(null)
      setIsLoading(false)
    }
  }, [refetch, status])

  return (
    <CreditsContext.Provider value={{
      credits: userData?.credits ?? null,
      userData,
      isLoading,
      error,
      refetch,
    }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCreditsContext() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider")
  }
  return context
}
