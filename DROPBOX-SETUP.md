# Dropbox setup for Heartstrings Jaco

Your site already lists all **40 SoundCloud tracks** (titles, dates, artwork).
Playback turns on **only after** each MP3 has a Dropbox share link in `src/data/songs.json`.

## Step-by-step

### 1. Create a folder

In Dropbox, create something like:

```text
Heartstrings Jaco / Website Audio
```

### 2. Download your masters from SoundCloud

For each song you want playable on the site:

1. Open the track on [soundcloud.com/heartstrings-jaco](https://soundcloud.com/heartstrings-jaco)
2. Download the original file **if** downloads are enabled on that track  
   (SoundCloud → track → **More** → **Download**), **or**
3. Use the original project export / DAW bounce you uploaded from (preferred quality)

Save files with clear names matching the catalog, e.g.:

```text
catch-my-breath.mp3
we-grew-together.mp3
one-look-is-all-it-takes.mp3
```

Tip: the `id` field in `songs.json` is the SoundCloud slug — use that as the filename.

### 3. Upload to Dropbox

Upload the MP3s into your folder. Prefer **MP3** for widest browser support.

### 4. Create a share link for each file

1. Right‑click the file → **Share** → **Create** / **Copy link**
2. Anyone with the link should be able to view (default)

You’ll get a link like:

```text
https://www.dropbox.com/s/abc123/catch-my-breath.mp3?dl=0
```

### 5. Paste the link into the catalog

Open `src/data/songs.json`, find the matching song by `id` or `title`, and set:

```json
"dropboxAudioUrl": "https://www.dropbox.com/s/abc123/catch-my-breath.mp3?dl=0"
```

Leave `dropboxAudioUrl` as `""` until that song is ready — the site shows **Soon** / “Awaiting Dropbox upload” and won’t try to play it.

### 6. Preview

```bash
npm run dev
```

Click the cover — the sticky player should stream the track.

---

## Suggested order

You don’t need all 40 at once. A good path:

1. Upload your **newest 5–10** songs first  
2. Confirm playback works  
3. Fill in the rest when you have time  

Newest tracks (as of last sync):

| Date | Title | Catalog `id` |
|------|--------|----------------|
| 2026-07-27 | Catch my breath | `catch-my-breath` |
| 2026-07-22 | We grew together | `we-grew-together` |
| 2026-07-15 | One look is all it takes | `one-look-is-all-it-takes` |
| 2026-07-09 | That colored ride | `that-colored-ride` |
| 2026-07-02 | Freedom | `freedom` |

---

## Re-sync SoundCloud metadata later

When you publish new tracks on SoundCloud:

```bash
node scripts/sync-soundcloud.mjs
```

This refreshes titles, dates, and covers from SoundCloud and **keeps any Dropbox links you already filled in**.

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Click does nothing | `dropboxAudioUrl` is still empty for that track |
| Player starts then stops | Share link may be wrong, private, or not an audio file |
| Cover missing | SoundCloud artwork URL can be re-synced with the script |
| Want one shared folder link | File-level share links work best for streaming; folder links are harder to map per song |

When a batch of links is ready, paste them here or into `songs.json` and we can wire them in for you.
