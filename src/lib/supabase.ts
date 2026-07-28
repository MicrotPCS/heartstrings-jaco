import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type SongStatRow = {
  song_id: string
  likes: number
  shares: number
}

type StatsConfig = {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

let client: SupabaseClient | null = null
let cloudReady = false
let initPromise: Promise<boolean> | null = null

function looksConfigured(url?: string, key?: string): boolean {
  const u = url?.trim() ?? ''
  const k = key?.trim() ?? ''
  if (!u || !k) return false
  if (k.includes('YOUR_') || k.includes('paste') || k.includes('PASTE')) return false
  return u.startsWith('http')
}

function createFrom(url: string, key: string): boolean {
  try {
    client = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    cloudReady = true
    return true
  } catch (e) {
    console.warn('Supabase client failed:', e)
    client = null
    cloudReady = false
    return false
  }
}

/**
 * Load stats backend config once:
 * 1) Vite env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — e.g. Render
 * 2) /stats-config.json in public/ — easy file-based setup
 */
export function initCloudStats(): Promise<boolean> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    if (looksConfigured(envUrl, envKey)) {
      return createFrom(envUrl!, envKey!)
    }

    try {
      const res = await fetch('/stats-config.json', { cache: 'no-store' })
      if (res.ok) {
        const cfg = (await res.json()) as StatsConfig
        if (looksConfigured(cfg.supabaseUrl, cfg.supabaseAnonKey)) {
          return createFrom(cfg.supabaseUrl!, cfg.supabaseAnonKey!)
        }
      }
    } catch (e) {
      console.warn('Could not load /stats-config.json:', e)
    }

    cloudReady = false
    client = null
    return false
  })()

  return initPromise
}

export function getSupabase(): SupabaseClient | null {
  return client
}

/** True after initCloudStats() succeeds with real credentials. */
export function hasCloudStats(): boolean {
  return cloudReady
}

/** Normalize RPC / row payloads (object or single-element array). */
export function asSongStatRow(data: unknown): SongStatRow | null {
  if (!data) return null
  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  if (typeof r.song_id !== 'string') return null
  return {
    song_id: r.song_id,
    likes: Number(r.likes) || 0,
    shares: Number(r.shares) || 0,
  }
}
