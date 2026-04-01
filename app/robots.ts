import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://astral.ai"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/settings/",
        "/api/",
        "/history/"
      ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
