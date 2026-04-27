import type { NextConfig } from 'next'

// Validate required environment variables at build time
const REQUIRED_STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!REQUIRED_STRIPE_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY environment variable is required but not set. ' +
    'Add it to your GitHub Actions secrets: Settings → Secrets → Actions.'
  );
}

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/ssr', '@supabase/auth-js', '@supabase/supabase-js'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
