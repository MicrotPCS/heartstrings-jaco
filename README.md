# Heartstrings

A modern country-artist website that lists your songs **in SoundCloud upload order** and plays the audio **from Dropbox** when someone clicks a cover thumbnail.

No SoundCloud or Dropbox API keys are required for day-to-day use. You maintain a simple catalog file, and the site handles sorting + playback.

---

## Quick start

```bash
cd heartstrings-jaco
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

Build for production:

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.).

---

## How it works

| Piece | Role |
|--------|------|
| **SoundCloud** | Source of truth for *when* each song was published (upload date) and optional public page links |
| **Dropbox** | Hosts the actual MP3/M4A files + optional cover images; share links power streaming |
| **`src/data/songs.json`** | Your catalog: title, dates, Dropbox links, covers |

Tracks are sorted by `soundcloudUploadDate` (newest first by default). Visitors click a thumbnail → HTML5 audio streams the Dropbox file → a sticky player bar appears at the bottom.

---

## Setup: put your songs in Dropbox

1. Create a folder in Dropbox, e.g. `Heartstrings / Website Audio`.
2. Upload each master as **MP3** (best browser support) or M4A.
3. For each file:
   - Right‑click → **Share** → **Create link** (or Copy link).
   - Anyone with the link must be able to view (Dropbox default for share links is fine).
4. Paste that link into `songs.json` as `dropboxAudioUrl`.

Example share link:

```text
https://www.dropbox.com/s/abc123xyz/sunset-drive.mp3?dl=0
```

The site automatically turns this into a streamable URL (`raw=1`) for the `<audio>` element. You do **not** need to change `dl=0` yourself.

### Covers (thumbnails)

- Upload square artwork (e.g. 1000×1000) to the same Dropbox folder and use its share link as `coverUrl`, **or**
- Use any public image URL (CDN, your own host, etc.).

Dropbox image share links are converted the same way as audio.

### Important Dropbox notes

- **Public share links** are required so visitors can play without logging in.
- Very large catalogs or heavy traffic may hit Dropbox bandwidth limits; for a growing fan base, consider moving audio to a CDN later (same JSON shape works).
- Newer Dropbox links look like `/scl/fi/...` — those are supported too.

---

## Setup: catalog each SoundCloud track

Open `src/data/songs.json` and replace the demo entries with yours:

```json
[
  {
    "id": "sunset-drive",
    "title": "Sunset Drive",
    "subtitle": "Single",
    "soundcloudUploadDate": "2025-11-12",
    "dropboxAudioUrl": "https://www.dropbox.com/s/xxxxx/sunset-drive.mp3?dl=0",
    "coverUrl": "https://www.dropbox.com/s/xxxxx/sunset-drive-cover.jpg?dl=0",
    "soundcloudUrl": "https://soundcloud.com/your-handle/sunset-drive",
    "description": "Written on a long drive home.",
    "durationSeconds": 214
  }
]
```

### Field reference

| Field | Required | Notes |
|--------|----------|--------|
| `id` | yes | Unique slug (used in React keys) |
| `title` | yes | Display name |
| `subtitle` | no | e.g. “feat. …”, “Live”, “Single” |
| `soundcloudUploadDate` | yes | `YYYY-MM-DD` — **SoundCloud upload date** (drives sort order) |
| `dropboxAudioUrl` | yes | Dropbox share link to the audio file |
| `coverUrl` | yes | Thumbnail image URL |
| `soundcloudUrl` | no | Link out to the SC page |
| `description` | no | Short blurb under the title |
| `durationSeconds` | no | Length in seconds for display |

### Finding the SoundCloud upload date

On each track page, SoundCloud shows when it was published. Use that calendar date as `soundcloudUploadDate`.  
Keep filenames in Dropbox clear (`2025-11-12-sunset-drive.mp3`) so matching stays easy.

Add a new object to the JSON array whenever you release something — no rebuild of backend services needed (just rebuild/redeploy the static site if it’s already hosted).

---

## Design

- Warm dark palette: charcoal brown, rust, wheat gold, soft sage  
- Display type: **Cormorant Garamond** · UI: **DM Sans**  
- Card grid + sticky “now playing” bar  
- Newest-first / oldest-first toggle  

Edit colors and fonts in `src/App.css` (`:root` variables) and `src/index.css` (Google Fonts import).  
Artist name and hero copy live in `src/components/Header.tsx` and `src/App.tsx` (About section).

---

## Optional later upgrades

- **Auto-sync from SoundCloud API** — pull titles/dates/art via API, still map file names to Dropbox  
- **Dropbox API + refresh tokens** — generate temporary direct links server-side if you outgrow share links  
- **Contact / mailing list / gig dates** — extra sections on the same page  
- **Analytics** — Plausible or similar on the static host  

If you want any of these, say which and we can wire them next.

---

## Project layout

```text
src/
  data/songs.json      ← your catalog
  components/          ← Header, SongCard, PlayerBar
  utils/dropbox.ts     ← share link → streamable URL
  App.tsx              ← sort + player state
  App.css              ← country modern theme
```

---

## Checklist for your first real release

1. [ ] Upload MP3s to Dropbox and copy share links  
2. [ ] Upload cover images (or pick public URLs)  
3. [ ] Note each track’s SoundCloud upload date  
4. [ ] Fill `src/data/songs.json`  
5. [ ] Update artist name / About copy  
6. [ ] `npm run dev` — click each cover and confirm audio plays  
7. [ ] `npm run build` and deploy `dist/`  

Enjoy the porch light.
