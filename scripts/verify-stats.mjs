/**
 * Quick check that Supabase stats work.
 *
 * Usage:
 *   node scripts/verify-stats.mjs
 *
 * Reads public/stats-config.json or env:
 *   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadConfig() {
  const envUrl = process.env.VITE_SUPABASE_URL
  const envKey = process.env.VITE_SUPABASE_ANON_KEY
  if (envUrl && envKey) return { supabaseUrl: envUrl, supabaseAnonKey: envKey }

  const path = join(root, 'public/stats-config.json')
  if (!existsSync(path)) {
    throw new Error(
      'Missing public/stats-config.json (or env VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)',
    )
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

async function main() {
  const cfg = loadConfig()
  const url = cfg.supabaseUrl?.trim()
  const key = cfg.supabaseAnonKey?.trim()
  if (!url || !key || key.includes('PASTE')) {
    throw new Error('Fill supabaseUrl and supabaseAnonKey first')
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }

  console.log('1) Reading song_stats…')
  const list = await fetch(`${url}/rest/v1/song_stats?select=*`, { headers })
  const listBody = await list.text()
  console.log('   status', list.status, listBody.slice(0, 200))

  console.log('2) Calling song_like(catch-my-breath)…')
  const like = await fetch(`${url}/rest/v1/rpc/song_like`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_song_id: 'catch-my-breath' }),
  })
  const likeBody = await like.text()
  console.log('   status', like.status, likeBody.slice(0, 300))

  if (!list.ok || !like.ok) {
    process.exitCode = 1
    console.error('\nFailed. Check SQL was run and the anon key is correct.')
    return
  }
  console.log('\nOK — cloud stats are working. Redeploy the site if needed.')
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
