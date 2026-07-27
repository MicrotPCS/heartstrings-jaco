/**
 * Convert a Dropbox share link into a URL suitable for <audio> / <img>.
 *
 * Supported inputs:
 * - https://www.dropbox.com/s/xxxxx/file.mp3?dl=0
 * - https://www.dropbox.com/scl/fi/xxxxx/file.mp3?...
 * - https://dl.dropboxusercontent.com/...
 * - Already-direct URLs are returned as-is
 */
export function toDropboxDirectUrl(url: string): string {
  if (!url) return url

  try {
    const u = new URL(url.trim())

    // Already a direct content host
    if (u.hostname.includes('dropboxusercontent.com')) {
      return u.toString()
    }

    // Classic /s/ and newer /scl/ share links
    if (u.hostname.includes('dropbox.com')) {
      // Prefer raw=1 for streaming media (works for audio + images)
      u.searchParams.delete('dl')
      u.searchParams.set('raw', '1')
      return u.toString()
    }

    return url
  } catch {
    return url
  }
}

/** Format seconds as m:ss */
export function formatDuration(seconds?: number): string {
  if (seconds == null || Number.isNaN(seconds) || seconds < 0) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Friendly date for UI */
export function formatUploadDate(isoDate: string): string {
  try {
    const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}
