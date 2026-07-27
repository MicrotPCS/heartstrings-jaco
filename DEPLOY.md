# Deploy Heartstrings to Render + Namecheap

Site domain: **https://heartstrings-country.com**  
GitHub: **https://github.com/MicrotPCS/heartstrings-jaco**

## 1. Code is on GitHub

Repo is public and ready:

```text
https://github.com/MicrotPCS/heartstrings-jaco
```

## 2. Create the static site on Render

### Option A — Blueprint (recommended)

1. Open [dashboard.render.com](https://dashboard.render.com) (sign in / create free account)
2. Connect GitHub if prompted (grant access to `MicrotPCS/heartstrings-jaco`)
3. **New** → **Blueprint**
4. Select **heartstrings-jaco**
5. Apply the blueprint — it creates **heartstrings-country** from `render.yaml`

### Option B — Manual static site (**preferred**)

1. **New** → **Static Site** (not “Web Service”)
2. Connect repo `MicrotPCS/heartstrings-jaco`, branch `main`
3. Settings:
   - **Name:** `heartstrings-country`
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist`
4. **Create Static Site**

> **Important:** Do **not** create a **Web Service** with Docker/Node unless you want a always-on server.  
> If you already did and saw `error Command "start" not found`, either:
> - Switch to a new **Static Site** (best), or  
> - Keep the web service — the repo now includes `npm start` which runs `serve -s dist` (auto-deploys on push).

You’ll get a temporary URL like:

```text
https://heartstrings-country.onrender.com
```

(The exact subdomain is shown in the Render dashboard.)  
Confirm the music site loads and a song plays there **before** changing DNS.

## 3. Add custom domain on Render

1. Open **heartstrings-country** → **Settings** → **Custom Domains**
2. **Add** `heartstrings-country.com`  
   (Render will usually also attach `www.heartstrings-country.com` and redirect one → the other)
3. Note your service’s `*.onrender.com` hostname for the CNAME step below

## 4. Point Namecheap DNS at Render

Per [Render’s Namecheap guide](https://render.com/docs/configure-namecheap-dns):

1. [Namecheap](https://www.namecheap.com) → **Domain List** → **heartstrings-country.com** → **Manage**
2. Open **Advanced DNS**
3. **Delete** any existing records that conflict:
   - `A` for `@`
   - `CNAME` / URL Redirect for `www`
   - Any **`AAAA`** records (Render is IPv4-only; AAAA can break the site)
4. **Add** these host records:

| Type | Host | Value | TTL |
|------|------|--------|-----|
| **A Record** | `@` | `216.24.57.1` | 1 min (for faster verify) |
| **CNAME Record** | `www` | `YOUR-SERVICE.onrender.com` | 1 min |

Replace `YOUR-SERVICE.onrender.com` with the exact hostname from the Render dashboard (e.g. `heartstrings-country.onrender.com`).

5. Save. DNS often works in **5–30 minutes** (can take longer).

## 5. Verify + HTTPS

1. Back in Render → Custom Domains → **Verify**
2. When green, Render issues free TLS (Let’s Encrypt)
3. Visit:
   - https://heartstrings-country.com  
   - https://www.heartstrings-country.com  

## 6. Future updates

```bash
git add -A && git commit -m "Update site" && git push
```

Render rebuilds from `main` automatically.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Domain not resolving | Check Advanced DNS; remove AAAA; wait; try `dig heartstrings-country.com` |
| SSL pending | DNS must point to Render first, then Verify |
| Site blank / old | Check Render deploy logs; hard-refresh browser |
| Audio fails only on live site | Test Dropbox link in a private window; confirm share is “anyone with link” |
| Build fails | Ensure `package-lock.json` is in the repo (it is) |
