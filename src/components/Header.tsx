export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <img
            className="brand-avatar"
            src="https://i1.sndcdn.com/avatars-wP7yOYLxHptZ9A9N-PUOL5g-t200x200.jpg"
            alt="Heartstrings Jaco, country music artist"
            width={44}
            height={44}
          />
          <div>
            <p className="brand-kicker">Country · Originals</p>
            <h1 className="brand-title">Heartstrings Jaco</h1>
          </div>
        </div>
        <nav className="header-nav" aria-label="Primary">
          <a href="#songs">Songs</a>
          <a href="#about">About</a>
          <a
            href="https://soundcloud.com/heartstrings-jaco"
            target="_blank"
            rel="noreferrer"
          >
            SoundCloud
          </a>
          <a
            href="https://open.spotify.com/artist/7LiBZXVXPxoRTuM6izeY2Z?si=9AFTWdu6RjagrYrkFAGLbg"
            target="_blank"
            rel="noreferrer"
          >
            Spotify
          </a>
          <a
            href="https://music.apple.com/us/artist/heartstrings-jaco/1850071609"
            target="_blank"
            rel="noreferrer"
          >
            Apple Music
          </a>
          <a
            href="https://www.amazon.com/music/player/artists/B0FYWS9M2Y/heartstrings-jaco"
            target="_blank"
            rel="noreferrer"
          >
            Amazon Music
          </a>
        </nav>
      </div>
      <div className="hero">
        <p className="hero-eyebrow">From the porch to the playlist</p>
        <h2 className="hero-title">
          To listen, press play on any track below.{' '}
          <strong className="hero-title-note">
            (No account or subscription required)
          </strong>
        </h2>
        <p className="hero-lede">
          Original country songs by Jaco van Zyl — ordered by when they landed
          on SoundCloud.
        </p>
      </div>
    </header>
  )
}
