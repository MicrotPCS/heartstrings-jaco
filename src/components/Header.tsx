export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <img
            className="brand-avatar"
            src="https://i1.sndcdn.com/avatars-wP7yOYLxHptZ9A9N-PUOL5g-t200x200.jpg"
            alt=""
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
        </nav>
      </div>
      <div className="hero">
        <p className="hero-eyebrow">From the porch to the playlist</p>
        <h2 className="hero-title">
          Stories you can hear.
          <br />
          <span>Press play on a track below.</span>
        </h2>
        <p className="hero-lede">
          Original country songs by Jaco van Zyl — ordered by when they landed
          on SoundCloud. Tap a cover to stream once the master is in Dropbox.
        </p>
      </div>
    </header>
  )
}
