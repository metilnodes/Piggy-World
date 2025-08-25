/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.warpcast.com https://*.farcaster.xyz https://warpcast.com https://farcaster.xyz"
          }
        ],
      },
    ]
  },
  env: {
    // Убедись, что DATABASE_URL использует pooler адрес (не raw compute endpoint)
    // Пример: postgresql://user:pass@...pooler.neon.tech/dbname
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    // Add Neynar API Key
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ❌ НЕ используем output: 'export' - это ломает API routes
  // output: 'export', // <-- убрано если было
}

export default nextConfig
