import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Astryxo",
  description: "Learn about the mission, values, and core story behind Astryxo, the world's most powerful enterprise-grade AI tools platform.",
  alternates: {
    canonical: "/about",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main>{children}</main>
}
