import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { PlayerBar } from './components/PlayerBar'
import { SongCard } from './components/SongCard'
import catalog from './data/songs.json'
import { useSongStats } from './hooks/useSongStats'
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
  const {
    isLiked,
    getLikeCount,
    getShareCount,
    toggleLike,
    recordShare,
    isGlobal,
  } = useSongStats()

  const ordered = useMemo(() => {
    const sorted = sortSongs(songs, sortOrder)
    return sorted.filter((song) => matchesQuery(song, searchQuery))
  }, [sortOrder, searchQuery])

  /** Playable queue in the order currently shown (sort + search). */
  const playQueue = useMemo(
    () => ordered.filter(hasDropboxAudio),
    [ordered],
  )

  const activeSong = songs.find((s) => s.id === activeId) ?? null
  const readyCount = useMemo(
    () => songs.filter(hasDropboxAudio).length,
    [],
  )
  const hasQuery = searchQuery.trim().length > 0

  // Deep-link from shared URLs: ?song=catch-my-breath
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const songId = params.get('song')
    if (!songId) return
    const match = songs.find((s) => s.id === songId)
    if (!match) return
    setActiveId(match.id)
    // Scroll after paint so the card exists
    requestAnimationFrame(() => {
      document.getElementById(`song-${match.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }, [])

  function handleSelect(song: Song) {
    if (!hasDropboxAudio(song)) return
    if (activeId === song.id) {
      setIsPlaying((p) => !p)
      return
    }
    setActiveId(song.id)
    setIsPlaying(true)
  }

  const handleEnded = useCallback(() => {
    if (!activeId) {
      setIsPlaying(false)
      return
    }
    const idx = playQueue.findIndex((s) => s.id === activeId)
    if (idx === -1 || idx >= playQueue.length - 1) {
      // End of the current list
      setIsPlaying(false)
      return
    }
    const next = playQueue[idx + 1]
    setActiveId(next.id)
    setIsPlaying(true)
  }, [activeId, playQueue])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`app${activeSong ? ' has-player' : ''}`}>
      <div className="bg-glow" aria-hidden />
      <Header />

      <main>
        <section
          id="songs"
          className="songs-section"
          aria-labelledby="collection-heading"
        >
          <div className="section-head">
            <div>
              <h2 id="collection-heading" className="section-title">
                The collection
              </h2>
              <p className="section-lede">
                Sorted by SoundCloud upload date · continuous play ·{' '}
                {hasQuery
                  ? `${ordered.length} match${ordered.length === 1 ? '' : 'es'}`
                  : `${songs.length} track${songs.length === 1 ? '' : 's'}`}
                {readyCount < songs.length && !hasQuery && (
                  <>
                    {' '}
                    · {readyCount} ready to play
                  </>
                )}
                {!isGlobal && (
                  <>
                    {' '}
                    · likes/shares are local until cloud stats are configured
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
                  isLiked={isLiked(song.id)}
                  likeCount={getLikeCount(song.id)}
                  shareCount={getShareCount(song.id)}
                  onSelect={handleSelect}
                  onToggleLike={(id) => {
                    void toggleLike(id)
                  }}
                  onShared={(id) => {
                    void recordShare(id)
                  }}
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

        <section id="about" className="about-section" aria-labelledby="about-heading">
          <h2 id="about-heading" className="section-title">
            About Heartstrings Jaco
          </h2>
          <p>
            Heartstrings Jaco is the music of <strong>Jaco van Zyl</strong> —
            original country and roots songs written with honesty and heart. I
            have a special place reserved for country music, especially in
            memory of my dad, and I also found freedom and liberation in reggae.
          </p>
          <p>
            This is the official free streaming home for every Heartstrings Jaco
            track, listed in the order it appeared on{' '}
            <a
              href="https://soundcloud.com/heartstrings-jaco"
              target="_blank"
              rel="noreferrer"
            >
              SoundCloud
            </a>
            . Tap a cover to play — no account or subscription needed. You can
            also find the music on Spotify, Apple Music, and Amazon Music.
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
        onEnded={handleEnded}
      />
    </div>
  )
}
