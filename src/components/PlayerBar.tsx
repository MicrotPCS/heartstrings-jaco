import { useEffect, useRef } from 'react'
import type { Song } from '../types'
import { formatDuration, toDropboxDirectUrl } from '../utils/dropbox'

interface PlayerBarProps {
  song: Song | null
  isPlaying: boolean
  onPlayingChange: (playing: boolean) => void
  onEnded: () => void
}

export function PlayerBar({
  song,
  isPlaying,
  onPlayingChange,
  onEnded,
}: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !song) return

    const src = toDropboxDirectUrl(song.dropboxAudioUrl)
    if (audio.src !== src) {
      audio.src = src
      audio.load()
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        // Autoplay blocked or bad URL — keep UI honest
        onPlayingChange(false)
      })
    } else {
      audio.pause()
    }
  }, [song, isPlaying, onPlayingChange])

  if (!song) return null

  const cover = toDropboxDirectUrl(song.coverUrl)

  return (
    <div className="player-bar" role="region" aria-label="Now playing">
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={onEnded}
        onPlay={() => onPlayingChange(true)}
        onPause={() => onPlayingChange(false)}
      />
      <img className="player-cover" src={cover} alt="" />
      <div className="player-info">
        <p className="player-title">{song.title}</p>
        <p className="player-sub">
          {song.subtitle || formatDuration(song.durationSeconds) || 'Now playing'}
        </p>
      </div>
      <button
        type="button"
        className="player-toggle"
        onClick={() => onPlayingChange(!isPlaying)}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
          </svg>
        )}
      </button>
    </div>
  )
}
