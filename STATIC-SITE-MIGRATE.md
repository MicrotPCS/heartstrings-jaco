# Switch Heartstrings to a Render Static Site (no cold starts)

Your site is static files (`dist/`). A **Web Service** sleeps on free tier → long first load.  
A **Static Site** is served from Render’s CDN → **no spin-up wait**.

You **cannot convert** a Web Service into a Static Site in place. Create a **new** Static Site, move the domain, then delete the old Web Service.

---

## 1. Create the Static Site (5 minutes)

1. Open [https://dashboard.render.com](https://dashboard.render.com)
2. **New +** → **Static Site**  
   (**Not** Web Service, **not** Docker)
3. Connect GitHub repo: **`MicrotPCS/heartstrings-jaco`**
4. Settings:

| Field | Value |
|--------|--------|
| **Name** | `heartstrings-static` (or `heartstrings-country-static`) |
| **Branch** | `main` |
| **Root Directory** | leave **empty** (repo root) |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

5. Click **Create Static Site**
6. Wait until status is **Live**
7. Open the free URL (e.g. `https://heartstrings-static.onrender.com`)
8. Confirm: songs play, likes/shares work, page loads **fast** even after waiting a while

### Optional rewrite (SPA)

If deep links like `?song=...` ever 404 on refresh (rare for query-only), in Static Site → **Redirects/Rewrites**:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | **Rewrite** |

---

## 2. Move your custom domain

### On the **new** Static Site

1. **Settings** → **Custom Domains**
2. Add:
   - `heartstrings-country.com`
   - `www.heartstrings-country.com` (if not auto-added)
3. Note the new service hostname, e.g.  
   `heartstrings-static.onrender.com`

### On Namecheap (only if `www` CNAME still points at the **old** Web Service)

1. **Domain List** → **heartstrings-country.com** → **Manage** → **Advanced DNS**
2. Keep apex **A** record: Host `@` → `216.24.57.1`
3. Update **CNAME**:
   - Host: `www`
   - Value: **`your-new-static-site.onrender.com`**  
     (the hostname shown on the new Static Site — not the old web service)
4. Remove any **AAAA** records
5. Save → wait a few minutes

### On Render

1. On the **new** Static Site → Custom Domains → **Verify** if needed  
2. On the **old Web Service** → remove `heartstrings-country.com` / `www` if still listed  
   (domain can only be active on one service)

### When HTTPS is green

Visit:

- https://heartstrings-country.com  
- https://www.heartstrings-country.com  

Hard-refresh. Test music + like counts.

---

## 3. Delete the old Web Service (stops sleep + frees clutter)

Only after the static URL and custom domain both look good:

1. Open the **old** Heartstrings **Web Service** (the one that used `npm start` / `yarn start`)
2. **Settings** → scroll to **Delete**
3. Confirm delete

You no longer need a Node process or cold starts for this site.

---

## 4. Future deploys

Same as before: push to `main` → Static Site rebuilds automatically.

```bash
git add -A && git commit -m "Update site" && git push
```

Likes/shares still use Supabase (`public/stats-config.json`) — no change.

---

## Checklist

- [ ] New **Static Site** live on `*.onrender.com`
- [ ] Music + likes work on that URL
- [ ] Custom domain on Static Site verified
- [ ] Namecheap `www` CNAME → **new** static hostname
- [ ] https://heartstrings-country.com loads fast (try after 30+ min idle)
- [ ] Old Web Service deleted

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Build fails | Check logs; `package-lock.json` must be in repo |
| Domain “already in use” | Remove domain from old Web Service first |
| Still slow after switch | Confirm you’re on **Static Site** type, not Web Service; DNS may still point at old service |
| Likes local-only again | Ensure deploy includes `public/stats-config.json` |
