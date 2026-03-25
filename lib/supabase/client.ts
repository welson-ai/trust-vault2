import { createBrowserClient } from "@supabase/ssr"

let cachedClient: any = null

export function createClient() {
  if (typeof window === "undefined") {
    // During SSR/build, return a mock client
    return null as any
  }

  // Return cached client if available
  if (cachedClient) {
    return cachedClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[v0] Supabase environment variables missing:", {
      url: !!url,
      key: !!key,
    })
    // Return a client with fallback values to prevent crashes
    // The actual error will occur when trying to use the client
    return createBrowserClient(
      url || "https://placeholder.supabase.co",
      key || "placeholder-key"
    )
  }

  cachedClient = createBrowserClient(url, key)
  return cachedClient
}
