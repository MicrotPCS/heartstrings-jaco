# Deploy Heartstrings (Render Static Site + Namecheap)

Site: **https://heartstrings-country.com**  
Repo: **https://github.com/MicrotPCS/heartstrings-jaco**

**Use a Render Static Site** (CDN, free, no cold starts).  
Do **not** use a Web Service / Docker / `npm start` for production.

Full migration steps (if you still have an old Web Service): see **[STATIC-SITE-MIGRATE.md](./STATIC-SITE-MIGRATE.md)**.

---

## Create Static Site

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Static Site**
2. Repo: `MicrotPCS/heartstrings-jaco`, branch `main`
3. Settings:

| Field | Value |
|--------|--------|
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

4. Create → wait for **Live** → open the `*.onrender.com` URL and test

Optional rewrite: `/*` → `/index.html` (Rewrite)

---

## Custom domain (Namecheap)

1. Static Site → **Custom Domains** → add `heartstrings-country.com` (+ `www`)
2. Namecheap → **Advanced DNS**:

| Type | Host | Value |
|------|------|--------|
| **A** | `@` | `216.24.57.1` |
| **CNAME** | `www` | `YOUR-STATIC-SITE.onrender.com` |

3. Remove **AAAA** records  
4. Render → **Verify** domain → wait for TLS  

---

## Global likes / shares

Configured via `public/stats-config.json` (Supabase). No Render env vars required if that file is in the repo.

---

## Updates

```bash
git add -A && git commit -m "Update" && git push
```

Render rebuilds the Static Site from `main`.
