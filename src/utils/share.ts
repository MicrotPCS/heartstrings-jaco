import type { Song } from '../types'

/** Canonical site URL used for share links when available. */
export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://heartstrings-country.com'
}

/** Deep-link URL for a specific song (opens site with that track highlighted). */
export function songShareUrl(song: Song): string {
  const url = new URL(getSiteOrigin())
  url.searchParams.set('song', song.id)
  return url.toString()
}

export function shareText(song: Song): string {
  return `Listen to “${song.title}” by Heartstrings Jaco`
}

export type SharePlatform =
  | 'facebook'
  | 'x'
  | 'whatsapp'
  | 'linkedin'
  | 'email'
  | 'copy'

export function platformShareUrl(
  platform: Exclude<SharePlatform, 'copy'>,
  song: Song,
): string {
  const url = encodeURIComponent(songShareUrl(song))
  const text = encodeURIComponent(shareText(song))

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`
    case 'x':
      return `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${shareText(song)} ${songShareUrl(song)}`)}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    case 'email':
      return `mailto:?subject=${encodeURIComponent(shareText(song))}&body=${encodeURIComponent(`${shareText(song)}\n\n${songShareUrl(song)}`)}`
  }
}

export async function copyShareUrl(song: Song): Promise<boolean> {
  const link = songShareUrl(song)
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link)
      return true
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = link
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
