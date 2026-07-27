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

export default function App() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const ordered = useMemo(() => sortSongs(songs, sortOrder), [sortOrder])
  const activeSong = ordered.find((s) => s.id === activeId) ?? null
  const readyCount = useMemo(
    () => songs.filter(hasDropboxAudio).length,
    [],
  )

  function handleSelect(song: Song) {
    if (!hasDropboxAudio(song)) return
    if (activeId === song.id) {
      setIsPlaying((p) => !p)
      return
    }
    setActiveId(song.id)
    setIsPlaying(true)
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
                Sorted by SoundCloud upload date · {ordered.length} track
                {ordered.length === 1 ? '' : 's'}
                {readyCount < ordered.length && (
                  <>
                    {' '}
                    · {readyCount} ready to play
                    {readyCount === 0 && ' (upload to Dropbox to enable)'}
                  </>
                )}
              </p>
            </div>
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

      <PlayerBar
        song={activeSong}
        isPlaying={isPlaying}
        onPlayingChange={setIsPlaying}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}
