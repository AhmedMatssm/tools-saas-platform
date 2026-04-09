import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'astralai.app';
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/', '/login', '/register'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
