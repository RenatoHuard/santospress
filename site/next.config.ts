import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'sistema.santospress.com.br' }],
        destination: '/sistema',
        permanent: false,
      },
    ]
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
