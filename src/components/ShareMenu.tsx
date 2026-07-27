import { useEffect, useId, useRef, useState } from 'react'
import type { Song } from '../types'
import {
  copyShareUrl,
  platformShareUrl,
  type SharePlatform,
} from '../utils/share'

interface ShareMenuProps {
  song: Song
  shareCount: number
  onShared: (songId: string) => void
}

const PLATFORMS: {
  id: Exclude<SharePlatform, 'copy'>
  label: string
}[] = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'email', label: 'Email' },
]

export function ShareMenu({ song, shareCount, onShared }: ShareMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function recordAndClose() {
    onShared(song.id)
    setOpen(false)
  }

  async function handleCopy() {
    const ok = await copyShareUrl(song)
    if (ok) {
      setCopied(true)
      onShared(song.id)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  function handlePlatform(platform: Exclude<SharePlatform, 'copy'>) {
    const href = platformShareUrl(platform, song)
    window.open(href, '_blank', 'noopener,noreferrer')
    recordAndClose()
  }

  return (
    <div className={`share-menu${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="share-btn"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.4 13.1 15.6 17M15.6 7 8.4 10.9" />
        </svg>
        <span>Share</span>
        {shareCount > 0 && (
          <span className="share-count" aria-label={`${shareCount} shares`}>
            {shareCount}
          </span>
        )}
      </button>

      {open && (
        <div className="share-panel" id={menuId} role="menu">
          <p className="share-panel-title">Share this song</p>
          <ul className="share-list">
            {PLATFORMS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handlePlatform(p.id)}
                >
                  {p.label}
                </button>
              </li>
            ))}
            <li>
              <button type="button" role="menuitem" onClick={() => void handleCopy()}>
                {copied ? 'Link copied!' : 'Copy link'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
