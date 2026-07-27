# Deploy Heartstrings to Render + Namecheap

Site domain: **https://heartstrings-country.com**

## 1. Push code to GitHub

This project should live in its own GitHub repo (e.g. `heartstrings-jaco`).

```bash
cd heartstrings-jaco
git init
git add .
git commit -m "Heartstrings country artist site"
gh repo create heartstrings-jaco --public --source=. --remote=origin --push
```

(If the repo already exists, use `git push -u origin main`.)

## 2. Create the static site on Render

### Option A — Blueprint (recommended)

1. Open [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Blueprint**
3. Connect the `heartstrings-jaco` GitHub repo
4. Render reads `render.yaml` and creates **heartstrings-country**
5. Apply / create

### Option B — Manual static site

1. **New** → **Static Site**
2. Connect repo `heartstrings-jaco`, branch `main`
3. Settings:
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist`
4. Create Static Site

You’ll get a temporary URL like:

```text
https://heartstrings-country.onrender.com
```

Confirm the music site loads and playback works there first.

## 3. Add custom domain on Render

1. Open the **heartstrings-country** service → **Settings** → **Custom Domains**
2. Add:
   - `heartstrings-country.com`
   - `www.heartstrings-country.com`
3. Render shows the DNS records you need (usually a **CNAME** to something like `heartstrings-country.onrender.com`, or an **A** record for the apex).

Copy those values carefully — Namecheap must match them exactly.

## 4. Point Namecheap DNS at Render

1. Log in to [Namecheap](https://www.namecheap.com) → **Domain List** → **heartstrings-country.com** → **Manage**
2. **Advanced DNS** tab
3. Remove any old **URL Redirect**, parking, or conflicting **A / CNAME** records for `@` and `www`
4. Add records as Render instructed. Typical setup:

| Type  | Host | Value | TTL  |
|-------|------|--------|------|
| **CNAME** | `www` | `heartstrings-country.onrender.com` | Automatic |
| **ALIAS / URL Redirect** or **A / ANAME** | `@` | *value from Render dashboard* | Automatic |

**Namecheap notes:**

- For the **root** (`@` / apex), Namecheap may not support CNAME on `@`. Prefer whatever Render lists (often their **A** records, or **ALIAS/ANAME** if available).
- If Render shows two A records, add both.
- Keep only one set of records for `@` and `www` — duplicates cause flaky DNS.
- DNS can take **5 minutes to a few hours** (sometimes up to 48h).

Official Render guide: [Configure Namecheap DNS](https://render.com/docs/configure-namecheap-dns)

## 5. Wait for HTTPS

Render issues a free TLS certificate via Let’s Encrypt once DNS validates. Status shows **Certificate issued** on the Custom Domains page.

Then open:

- https://heartstrings-country.com  
- https://www.heartstrings-country.com  

## 6. Future updates

```bash
# After changing songs.json or site code:
git add -A && git commit -m "Update catalog" && git push
```

Render auto-deploys from `main`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Domain not resolving | Check Namecheap Advanced DNS; wait for propagation (`dig heartstrings-country.com`) |
| SSL pending | DNS must point to Render first; wait for certificate |
| Site blank / old version | Clear cache; confirm latest deploy succeeded on Render |
| Audio doesn’t play | Dropbox links must be public share links; test onrender.com URL first |
| Build fails on Render | Check build logs; ensure `package-lock.json` is committed |
