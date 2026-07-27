/**
 * Pull public track metadata for Heartstrings Jaco from SoundCloud
 * and merge into src/data/songs.json without wiping Dropbox links.
 *
 * Usage: node scripts/sync-soundcloud.mjs
 *
 * Note: Uses SoundCloud’s public web client_id (same approach as the
 * website). If sync fails, open soundcloud.com once, then retry — or
 * set SOUNDCLOUD_CLIENT_ID in the environment.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CATALOG = join(ROOT, 'src/data/songs.json')
const USER_URL = 'https://soundcloud.com/heartstrings-jaco'
const USER_ID = '1694667551'

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function discoverClientId() {
  if (process.env.SOUNDCLOUD_CLIENT_ID) return process.env.SOUNDCLOUD_CLIENT_ID
  const html = await fetchText(USER_URL)
  const scripts = [...html.matchAll(/https:\/\/a-v2\.sndcdn\.com\/assets\/[^"']+\.js/g)].map(
    (m) => m[0],
  )
  const patterns = [
    /client_id["']?\s*[:=]\s*["']([a-zA-Z0-9]{16,40})["']/,
    /client_id=([a-zA-Z0-9]{16,40})/,
  ]
  for (const src of scripts) {
    const js = await fetchText(src)
    for (const re of patterns) {
      const m = js.match(re)
      if (m) return m[1]
    }
  }
  throw new Error('Could not discover SoundCloud client_id')
}

async function fetchAllTracks(clientId) {
  let url = `https://api-v2.soundcloud.com/users/${USER_ID}/tracks?client_id=${clientId}&limit=50&linked_partitioning=1`
  const all = []
  while (url) {
    const data = await fetchJson(url)
    all.push(...(data.collection || []))
    url = data.next_href
      ? `${data.next_href}${data.next_href.includes('client_id') ? '' : `&client_id=${clientId}`}`
      : null
  }
  return all
}

function mapTrack(t) {
  const title = t.title || 'Untitled'
  const created = (t.created_at || '').slice(0, 10)
  const durMs = t.duration || 0
  let artwork = t.artwork_url || t.user?.avatar_url || ''
  if (artwork) {
    artwork = artwork.replace('-large', '-t500x500').replace('-badge', '-t500x500')
  }
  const desc = (t.description || '').trim()
  const short = desc
    ? desc.split('\n')[0].replace(/\s+/g, ' ').trim().slice(0, 160)
    : undefined

  const song = {
    id: t.permalink || String(t.id),
    title,
    soundcloudUploadDate: created,
    dropboxAudioUrl: '',
    coverUrl: artwork,
    soundcloudUrl: t.permalink_url || '',
  }
  if (t.genre) song.subtitle = t.genre
  if (short) song.description = short
  if (durMs) song.durationSeconds = Math.round(durMs / 1000)
  return song
}

function main() {
  return (async () => {
    console.log('Discovering SoundCloud client_id…')
    const clientId = await discoverClientId()
    console.log('Fetching tracks for', USER_URL)
    const tracks = await fetchAllTracks(clientId)
    console.log(`Got ${tracks.length} tracks`)

    const existing = existsSync(CATALOG)
      ? JSON.parse(readFileSync(CATALOG, 'utf8'))
      : []
    const byId = new Map(existing.map((s) => [s.id, s]))

    const merged = tracks.map((t) => {
      const mapped = mapTrack(t)
      const prev = byId.get(mapped.id)
      if (prev?.dropboxAudioUrl) {
        mapped.dropboxAudioUrl = prev.dropboxAudioUrl
      }
      // Prefer previously customized description if SC has none
      if (!mapped.description && prev?.description) {
        mapped.description = prev.description
      }
      return mapped
    })

    merged.sort((a, b) =>
      a.soundcloudUploadDate < b.soundcloudUploadDate
        ? 1
        : a.soundcloudUploadDate > b.soundcloudUploadDate
          ? -1
          : 0,
    )

    writeFileSync(CATALOG, JSON.stringify(merged, null, 2) + '\n')
    const ready = merged.filter((s) => s.dropboxAudioUrl?.trim()).length
    console.log(`Wrote ${merged.length} songs → src/data/songs.json`)
    console.log(`${ready} have Dropbox links; ${merged.length - ready} still need upload`)
  })()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
