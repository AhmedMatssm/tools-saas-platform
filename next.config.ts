import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Security: Disable X-Powered-By header
  poweredByHeader: false,
  
  // 2. Security: Enable React Strict Mode for better error catching
  reactStrictMode: true,

  // 3. Security: Global Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Anti-clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // X-Content-Type-Options
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()", // Permissions Policy
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Cross-Origin Isolation Headers
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
      // 4. Security: CORS for API Routes
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Repleace '*' with your production URL for maximum security
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
      // Ensure specific CSP for all routes
      {
         source: "/(.*)",
         headers: [
           {
             key: "Content-Security-Policy",
             value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; connect-src 'self' https://*.supabase.co https://*.pooler.supabase.com https://api.astralai.vercel.app; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://accounts.google.com; object-src 'none'; upgrade-insecure-requests;",
           }
         ]
      }
    ];
  },

  turbopack: {
    root: "./"
  }
};

export default nextConfig;
