import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'santospress.com.br',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}

export default config
