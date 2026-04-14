import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

// Singleton — one client per browser session
let _client: SupabaseClient | null = null

function makeStub(): SupabaseClient {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  } as unknown as SupabaseClient
}

/** A storage adapter that silently swallows any localStorage errors (broken sandbox, SSR mocks, etc.) */
const safeStorage = {
  getItem(key: string): string | null {
    try { return window.localStorage.getItem(key) } catch { return null }
  },
  setItem(key: string, value: string): void {
    try { window.localStorage.setItem(key, value) } catch { /* ignore */ }
  },
  removeItem(key: string): void {
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
  },
}

export function createClient(): SupabaseClient {
  // Never touch localStorage during SSR
  if (typeof window === 'undefined') return makeStub()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return makeStub()

  if (!_client) {
    try {
      _client = createBrowserClient(url, key, {
        auth: { storage: safeStorage },
      })
    } catch {
      return makeStub()
    }
  }
  return _client
}
