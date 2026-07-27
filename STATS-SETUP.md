# Global likes & shares (all visitors see the same totals)

## Why it looked “per device”

A pure static site has **no shared database**.  
Likes/shares were saved in each browser’s `localStorage`, so your phone and laptop (and every visitor) each kept **private** numbers.

To show **one total for everyone**, the site must talk to a small cloud database.  
This project uses **Supabase** (free tier is enough). The website stays static on Render; only the counters are shared.

```text
Visitor A likes a song  →  Supabase likes +1  →  every open browser sees the new total
Visitor B shares a song →  Supabase shares +1 →  same for everyone
```

Your browser still remembers **whether you liked** a track (so the heart stays filled for you and you can’t stack unlimited likes from one device without unliking first).

---

## One-time setup (~10 minutes)

### 1. Create a free Supabase project

1. Go to [https://supabase.com](https://supabase.com) → sign up / log in  
2. **New project** → pick a name (e.g. `heartstrings`) and a password  
3. Wait until the project is ready  

### 2. Create the database tables + functions

1. In Supabase: **SQL** → **New query**  
2. Open the file `supabase/song_stats.sql` in this repo  
3. Paste the whole file into the SQL editor → **Run**  

### 3. Turn on live updates (optional but nice)

1. **Database** → **Publications** → `supabase_realtime`  
2. Enable the `song_stats` table  
   *or* run:

```sql
alter publication supabase_realtime add table public.song_stats;
```

### 4. Copy your API keys

Supabase → **Project Settings** → **API**:

| Name | Use as |
|------|--------|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon public** key | `VITE_SUPABASE_ANON_KEY` |

### 5. Local development

Create `.env` in the project root (never commit this file):

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Then:

```bash
npm run dev
```

### 6. Production on Render

Vite bakes env vars in at **build** time.

1. Render dashboard → your service → **Environment**  
2. Add:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. **Manual Deploy** → **Clear build cache & deploy** (important so the new keys are included)

---

## How to check it’s working

1. Open the site on phone and computer  
2. Like a song on one device  
3. Refresh the other — the **like count** should match  
4. Share a song — **share count** should match on both  

If keys are missing, the site still works but counts stay **local only** (old behaviour).

---

## Security note

The public **anon** key is meant for browsers. Anyone can call the like/share functions (that’s how a public counter works).  
For a music site this is normal. If you ever get spam bots, we can add rate limits or a tiny private API later.
