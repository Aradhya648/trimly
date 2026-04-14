import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep Supabase packages out of the server bundle so they run in native
  // Node.js (window === undefined) and never touch a jsdom localStorage mock.
  serverExternalPackages: ['@supabase/ssr', '@supabase/auth-js', '@supabase/supabase-js'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
