"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { CreditsProvider } from "./credits-provider"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <CreditsProvider>
        <NextThemesProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          disableTransitionOnChange
          {...props}
        >
          {children}
        </NextThemesProvider>
      </CreditsProvider>
    </SessionProvider>
  )
}
