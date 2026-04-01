"use client"

import { useCreditsContext } from "@/components/global/credits-provider"

/**
 * Hook to consume the global Credits context.
 * This ensures that all components see the same credit balance and update together.
 * NEVER store credits as static or client-only values.
 */
export function useCredits() {
  return useCreditsContext()
}

export type { UserCreditsData, UseCreditsReturn } from "@/components/global/credits-provider"
