import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { PlayerBar } from './components/PlayerBar'
import { SongCard } from './components/SongCard'
import catalog from './data/songs.json'
import type { Song, SortOrder } from './types'
import { hasDropboxAudio } from './types'
import './App.css'

const songs = catalog as Song[]

function sortSongs(list: Song[], order: SortOrder): Song[] {
  return [...list].sort((a, b) => {
    const ta = new Date(a.soundcloudUploadDate).getTime()
    const tb = new Date(b.soundcloudUploadDate).getTime()
    return order === 'newest' ? tb - ta : ta - tb
  })
}

function matchesQuery(song: Song, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    song.title,
    song.subtitle,
    song.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export default function App() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const ordered = useMemo(() => {
    const sorted = sortSongs(songs, sortOrder)
    return sorted.filter((song) => matchesQuery(song, searchQuery))
  }, [sortOrder, searchQuery])

  const activeSong = songs.find((s) => s.id === activeId) ?? null
  const readyCount = useMemo(
    () => songs.filter(hasDropboxAudio).length,
    [],
  )
  const hasQuery = searchQuery.trim().length > 0

  function handleSelect(song: Song) {
    if (!hasDropboxAudio(song)) return
    if (activeId === song.id) {
      setIsPlaying((p) => !p)
      return
    }
    setActiveId(song.id)
    setIsPlaying(true)
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`app${activeSong ? ' has-player' : ''}`}>
      <div className="bg-glow" aria-hidden />
      <Header />

      <main>
        <section id="songs" className="songs-section">
          <div className="section-head">
            <div>
              <h2 className="section-title">The collection</h2>
              <p className="section-lede">
                Sorted by SoundCloud upload date ·{' '}
                {hasQuery
                  ? `${ordered.length} match${ordered.length === 1 ? '' : 'es'}`
                  : `${songs.length} track${songs.length === 1 ? '' : 's'}`}
                {readyCount < songs.length && !hasQuery && (
                  <>
                    {' '}
                    · {readyCount} ready to play
                    {readyCount === 0 && ' (upload to Dropbox to enable)'}
                  </>
                )}
              </p>
            </div>
            <div className="section-tools">
              <label className="song-search">
                <span className="visually-hidden">Search songs</span>
                <svg
                  className="song-search-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search song name…"
                  autoComplete="off"
                  spellCheck={false}
                />
                {hasQuery && (
                  <button
                    type="button"
                    className="song-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </label>
              <div className="sort-control" role="group" aria-label="Sort order">
                <button
                  type="button"
                  className={sortOrder === 'newest' ? 'is-on' : ''}
                  onClick={() => setSortOrder('newest')}
                >
                  Newest first
                </button>
                <button
                  type="button"
                  className={sortOrder === 'oldest' ? 'is-on' : ''}
                  onClick={() => setSortOrder('oldest')}
                >
                  Oldest first
                </button>
              </div>
            </div>
          </div>

          {ordered.length > 0 ? (
            <div className="song-grid">
              {ordered.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isActive={song.id === activeId}
                  isPlaying={isPlaying && song.id === activeId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <p className="search-empty">
              No songs match “{searchQuery.trim()}”.
              <button
                type="button"
                className="search-empty-clear"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            </p>
          )}
        </section>

        <section id="about" className="about-section">
          <h2 className="section-title">About</h2>
          <p>
            I have a special place in my heart reserved for Country Music,
            especially in memory of my dad. Then I also discovered the freedom
            and liberation of reggae music…
          </p>
          <p>
            This site lists every Heartstrings Jaco track in the order it
            appeared on{' '}
            <a
              href="https://soundcloud.com/heartstrings-jaco"
              target="_blank"
              rel="noreferrer"
            >
              SoundCloud
            </a>
            . When a master is shared from Dropbox, the cover becomes playable
            for anyone — no account needed.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} Heartstrings Jaco ·{' '}
          <a
            href="https://soundcloud.com/heartstrings-jaco"
            target="_blank"
            rel="noreferrer"
          >
            soundcloud.com/heartstrings-jaco
          </a>
        </p>
      </footer>

      <button
        type="button"
        className="back-to-top"
        onClick={scrollToTop}
        aria-label="Go to top of page"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M12 5.5 5.5 12H10v7h4v-7h4.5L12 5.5z" />
        </svg>
        <span>Top</span>
      </button>

      <PlayerBar
        song={activeSong}
        isPlaying={isPlaying}
        onPlayingChange={setIsPlaying}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
