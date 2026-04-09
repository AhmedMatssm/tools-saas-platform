import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { cn } from "@/utils";
import { Providers } from "@/components/layout/providers";
import { Chatbot } from "@/components/layout/chatbot";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://astryxo.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Astryxo | Premium AI Tools & SaaS Platform",
    template: "%s | Astryxo",
  },
  description: "Elevate your workflow with Astryxo, the ultimate AI tools platform. Access top AI productivity tools, intelligent automations, and premium generative models in one ecosystem.",
  keywords: ["AI tools platform", "best AI tools", "AI productivity tools", "SaaS AI platform", "Astryxo AI", "Automation"],
  authors: [{ name: "Astryxo Technologies", url: APP_URL }],
  creator: "Astryxo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Astryxo | Premium AI Tools & SaaS Platform",
    description: "Elevate your workflow with Astryxo, the ultimate AI tools platform. Access top AI productivity tools and intelligent automations.",
    siteName: "Astryxo",
    images: [
      {
        url: `${APP_URL}/og-image.webp`,
        width: 1200,
        height: 630,
        alt: "Astryxo AI Platform Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astryxo | Premium AI Tools & SaaS Platform",
    description: "Discover the best AI productivity tools and SaaS solutions on Astryxo.",
    images: [`${APP_URL}/og-image.webp`],
    creator: "@astryxohq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: `${APP_URL}/site.webmanifest`,
  icons: {
    icon: "/logo.svg",
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      'en-US': '/en',
      'fr-FR': '/fr',
      'ar-SA': '/ar',
    },
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Astryxo",
  url: APP_URL,
  logo: `${APP_URL}/logo.svg`,
  sameAs: [
    "https://twitter.com/astryxohq",
    "https://linkedin.com/company/astryxo",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>
          <Navbar />
          <main className="flex-1 pt-24 pb-12">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <Chatbot />
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
