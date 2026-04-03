import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { cn } from "@/utils";
import { Providers } from "@/components/layout/providers";
import { Chatbot } from "@/components/layout/chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ASTRAL AI | Manifest Your Vision in Seconds",
  description: "The ultimate AI SaaS platform for modern creators. Generate high-fidelity images, use professional flux tools, and automate your workflow with ASTRAL AI.",
  keywords: ["AI", "SaaS", "Image Generation", "ASTRAL AI", "Content Creation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <body 
        suppressHydrationWarning={true}
        className={cn(inter.className, "bg-background text-foreground min-h-screen flex flex-col antialiased")}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 pt-24 pb-12">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
