import type { Song } from '../types'
import { hasDropboxAudio } from '../types'
import { formatDuration, formatUploadDate, toDropboxDirectUrl } from '../utils/dropbox'

interface SongCardProps {
  song: Song
  isActive: boolean
  isPlaying: boolean
  onSelect: (song: Song) => void
}

export function SongCard({ song, isActive, isPlaying, onSelect }: SongCardProps) {
  const cover = toDropboxDirectUrl(song.coverUrl)
  const duration = formatDuration(song.durationSeconds)
  const playable = hasDropboxAudio(song)

  return (
    <article
      className={`song-card${isActive ? ' is-active' : ''}${isPlaying ? ' is-playing' : ''}${playable ? '' : ' is-pending'}`}
    >
      <button
        type="button"
        className="song-thumb"
        onClick={() => onSelect(song)}
        disabled={!playable}
        aria-label={
          !playable
            ? `${song.title} — audio not on Dropbox yet`
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
          <p className="song-pending-note">Awaiting Dropbox upload</p>
        )}
        {song.description && (
          <p className="song-desc">{song.description}</p>
        )}
        {song.soundcloudUrl && (
          <a
            className="song-sc-link"
            href={song.soundcloudUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open on SoundCloud
          </a>
        )}
      </div>
    </article>
  )
}
