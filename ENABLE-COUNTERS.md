# Enable global likes & shares (one key, then deploy)

Your SQL is already done. You only need the **anon public** key on the website.

## Easiest path: `stats-config.json`

### 1. Copy your anon key from Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **MicrotPCS's Project**
2. **Project Settings** (gear) → **API**
3. Copy **`anon` `public`** key (long string starting with `eyJ`)

### 2. Create the config file on your computer

In the `heartstrings-jaco` folder, create:

`public/stats-config.json`

```json
{
  "supabaseUrl": "https://cxedgfgqvwxacqeoexgs.supabase.co",
  "supabaseAnonKey": "eyJ...paste_full_anon_key_here..."
}
```

(Use your real key — one line, no spaces.)

### 3. Optional: verify from your Mac

```bash
cd heartstrings-jaco
node scripts/verify-stats.mjs
```

You want: `OK — cloud stats are working`.

### 4. Publish

```bash
git add public/stats-config.json
git commit -m "Enable cloud likes and shares"
git push
```

Wait for Render to finish deploying, then hard-refresh https://heartstrings-country.com

### 5. Test (all users)

1. Open the site in **Chrome**
2. Open the site in **Incognito / another phone**
3. Like a song in Chrome → count becomes 1  
4. Refresh the other browser → **same count**  
5. Supabase → **Table Editor** → **song_stats** should show rows

Also: the grey note *“likes/shares are local until cloud stats are configured”* should **disappear**.

---

## Alternative: Render Environment (instead of the JSON file)

On the **Heartstrings** service only:

| Key | Value |
|-----|--------|
| `VITE_SUPABASE_URL` | `https://cxedgfgqvwxacqeoexgs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your anon key |

Then **Manual Deploy → Clear build cache & deploy**.

You only need **one** of: JSON file **or** Render env vars.
