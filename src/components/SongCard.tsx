import type { Song } from '../types'
import { hasDropboxAudio } from '../types'
import { formatDuration, formatUploadDate, toDropboxDirectUrl } from '../utils/dropbox'
import { ShareMenu } from './ShareMenu'

/** Songs that already carry their own songwriter copyright notice. */
const SKIP_DEFAULT_COPYRIGHT = new Set(['back-to-the-bright-days-adri'])

interface SongCardProps {
  song: Song
  isActive: boolean
  isPlaying: boolean
  isLiked: boolean
  shareCount: number
  onSelect: (song: Song) => void
  onToggleLike: (songId: string) => void
  onShared: (songId: string) => void
}

export function SongCard({
  song,
  isActive,
  isPlaying,
  isLiked,
  shareCount,
  onSelect,
  onToggleLike,
  onShared,
}: SongCardProps) {
  const cover = toDropboxDirectUrl(song.coverUrl)
  const duration = formatDuration(song.durationSeconds)
  const playable = hasDropboxAudio(song)
  const showDefaultCopyright = !SKIP_DEFAULT_COPYRIGHT.has(song.id)

  return (
    <article
      className={`song-card${isActive ? ' is-active' : ''}${isPlaying ? ' is-playing' : ''}${playable ? '' : ' is-pending'}${isLiked ? ' is-liked' : ''}`}
      id={`song-${song.id}`}
    >
      <button
        type="button"
        className="song-thumb"
        onClick={() => onSelect(song)}
        disabled={!playable}
        aria-label={
          !playable
            ? `${song.title} — not available yet`
            : isPlaying && isActive
              ? `Pause ${song.title}`
              : `Play ${song.title}`
        }
      >
        <img src={cover} alt="" loading="lazy" />
        {playable ? (
          <span className="play-badge" aria-hidden>
            {isActive && isPlaying ? (
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
              </svg>
            )}
          </span>
        ) : (
          <span className="pending-badge" aria-hidden>
            Soon
          </span>
        )}
        {isActive && isPlaying && (
          <span className="eq" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        )}
      </button>

      <div className="song-meta">
        <div className="song-meta-top">
          <h3 className="song-title">{song.title}</h3>
          {duration && <span className="song-duration">{duration}</span>}
        </div>
        {song.subtitle && <p className="song-subtitle">{song.subtitle}</p>}
        <p className="song-date">
          On SoundCloud · {formatUploadDate(song.soundcloudUploadDate)}
        </p>
        {!playable && (
          <p className="song-pending-note">Coming soon</p>
        )}
        {song.description && (
          <p className="song-desc">{song.description}</p>
        )}
        {showDefaultCopyright && (
          <p className="song-copyright">
            © 2026 Jaco van Zyl — All Rights Reserved
          </p>
        )}

        <div className="song-actions">
          <div className="song-action-group">
            <button
              type="button"
              className={`like-btn${isLiked ? ' is-liked' : ''}`}
              onClick={() => onToggleLike(song.id)}
              aria-pressed={isLiked}
              aria-label={
                isLiked ? `Unlike ${song.title}` : `Like ${song.title}`
              }
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                <path d="M12 21s-6.5-4.35-9.33-8.18C.74 10.4 1.1 6.9 3.7 5.2c2.1-1.4 4.7-.9 6.1 1l2.2 2.6 2.2-2.6c1.4-1.9 4-2.4 6.1-1 2.6 1.7 3 5.2 1 7.62C18.5 16.65 12 21 12 21z" />
              </svg>
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <ShareMenu
              song={song}
              shareCount={shareCount}
              onShared={onShared}
            />
          </div>
          {song.soundcloudUrl && (
            <a
              className="song-sc-link"
              href={song.soundcloudUrl}
              target="_blank"
              rel="noreferrer"
            >
              SoundCloud
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
