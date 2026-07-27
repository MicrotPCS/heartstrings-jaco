import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when cloud stats are configured for this build. */
export const hasCloudStats = Boolean(url?.trim() && anonKey?.trim())

export type SongStatRow = {
  song_id: string
  likes: number
  shares: number
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!hasCloudStats) return null
  if (!client) {
    client = createClient(url!.trim(), anonKey!.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return client
}
