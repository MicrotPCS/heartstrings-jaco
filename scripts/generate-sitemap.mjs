/**
 * Writes public/sitemap.xml from the song catalog.
 * Run before production builds.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const songs = JSON.parse(
  readFileSync(join(root, 'src/data/songs.json'), 'utf8'),
)

const SITE = 'https://heartstrings-country.com'
const today = new Date().toISOString().slice(0, 10)

const urls = [
  {
    loc: `${SITE}/`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    loc: `${SITE}/#songs`,
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    loc: `${SITE}/#about`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.6',
  },
]

for (const song of songs) {
  if (!song?.id) continue
  urls.push({
    loc: `${SITE}/?song=${encodeURIComponent(song.id)}`,
    lastmod: song.soundcloudUploadDate || today,
    changefreq: 'monthly',
    priority: '0.7',
  })
}

function entry(u) {
  return `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry).join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`Wrote sitemap.xml with ${urls.length} URLs`)
