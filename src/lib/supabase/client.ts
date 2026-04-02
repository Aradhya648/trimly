import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // Return a no-op stub when credentials are not configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
      },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
    } as unknown as SupabaseClient
  }

  // Safe localStorage access (avoid SSR crashes)
  let storage: Storage | undefined = undefined
  if (typeof window !== 'undefined') {
    try {
      storage = window.localStorage
    } catch (e) {
      storage = undefined
    }
  }

  return createBrowserClient(url, key, {
    global: { headers: {} },
    auth: { storage },
  })
}
