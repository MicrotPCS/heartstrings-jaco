import { useCallback, useEffect, useState } from 'react'
import { getSupabase, hasCloudStats, type SongStatRow } from '../lib/supabase'

const LIKED_KEY = 'heartstrings-liked-ids'
const LOCAL_STATS_KEY = 'heartstrings-local-stats'

type CountMap = Record<string, number>

type LocalStats = {
  likes: CountMap
  shares: CountMap
}

function readLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function writeLikedIds(ids: Set<string>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore
  }
}

function readLocalStats(): LocalStats {
  try {
    const raw = localStorage.getItem(LOCAL_STATS_KEY)
    if (!raw) return { likes: {}, shares: {} }
    const parsed = JSON.parse(raw) as LocalStats
    return {
      likes: parsed.likes ?? {},
      shares: parsed.shares ?? {},
    }
  } catch {
    return { likes: {}, shares: {} }
  }
}

function writeLocalStats(stats: LocalStats) {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

function rowsToMaps(rows: SongStatRow[]): {
  likes: CountMap
  shares: CountMap
} {
  const likes: CountMap = {}
  const shares: CountMap = {}
  for (const row of rows) {
    likes[row.song_id] = Number(row.likes) || 0
    shares[row.song_id] = Number(row.shares) || 0
  }
  return { likes, shares }
}

/**
 * Global likes & shares when Supabase env vars are set.
 * Without them, falls back to this browser only.
 * "I liked this" (heart filled) is always per-browser.
 */
export function useSongStats() {
  const [likeCounts, setLikeCounts] = useState<CountMap>({})
  const [shareCounts, setShareCounts] = useState<CountMap>({})
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLikedIds(readLikedIds())

    const supabase = getSupabase()
    if (!supabase) {
      const local = readLocalStats()
      setLikeCounts(local.likes)
      setShareCounts(local.shares)
      setReady(true)
      return
    }

    let cancelled = false

    async function load() {
      const { data, error } = await supabase!
        .from('song_stats')
        .select('song_id, likes, shares')

      if (cancelled) return
      if (error) {
        console.warn('Could not load song stats:', error.message)
        setReady(true)
        return
      }
      const maps = rowsToMaps((data ?? []) as SongStatRow[])
      setLikeCounts(maps.likes)
      setShareCounts(maps.shares)
      setReady(true)
    }

    void load()

    const channel = supabase
      .channel('song_stats_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'song_stats' },
        (payload) => {
          const row = (payload.new ?? payload.old) as SongStatRow | null
          if (!row?.song_id) return
          if (payload.eventType === 'DELETE') {
            setLikeCounts((p) => {
              const n = { ...p }
              delete n[row.song_id]
              return n
            })
            setShareCounts((p) => {
              const n = { ...p }
              delete n[row.song_id]
              return n
            })
            return
          }
          setLikeCounts((p) => ({ ...p, [row.song_id]: Number(row.likes) || 0 }))
          setShareCounts((p) => ({
            ...p,
            [row.song_id]: Number(row.shares) || 0,
          }))
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [])

  const isLiked = useCallback(
    (songId: string) => likedIds.has(songId),
    [likedIds],
  )

  const getLikeCount = useCallback(
    (songId: string) => likeCounts[songId] ?? 0,
    [likeCounts],
  )

  const getShareCount = useCallback(
    (songId: string) => shareCounts[songId] ?? 0,
    [shareCounts],
  )

  const applyRow = useCallback((row: SongStatRow | null | undefined) => {
    if (!row?.song_id) return
    setLikeCounts((p) => ({ ...p, [row.song_id]: Number(row.likes) || 0 }))
    setShareCounts((p) => ({ ...p, [row.song_id]: Number(row.shares) || 0 }))
  }, [])

  const toggleLike = useCallback(
    async (songId: string) => {
      const wasLiked = likedIds.has(songId)
      const nextLiked = new Set(likedIds)
      if (wasLiked) nextLiked.delete(songId)
      else nextLiked.add(songId)

      setLikedIds(nextLiked)
      writeLikedIds(nextLiked)

      setLikeCounts((prev) => {
        const current = prev[songId] ?? 0
        const next = {
          ...prev,
          [songId]: wasLiked ? Math.max(0, current - 1) : current + 1,
        }
        if (!hasCloudStats) {
          const stats = readLocalStats()
          stats.likes = next
          writeLocalStats(stats)
        }
        return next
      })

      const supabase = getSupabase()
      if (!supabase) return

      const { data, error } = await supabase.rpc(
        wasLiked ? 'song_unlike' : 'song_like',
        { p_song_id: songId },
      )

      if (error) {
        console.warn('Like sync failed:', error.message)
        setLikedIds(likedIds)
        writeLikedIds(likedIds)
        setLikeCounts((prev) => ({
          ...prev,
          [songId]: wasLiked
            ? (prev[songId] ?? 0) + 1
            : Math.max(0, (prev[songId] ?? 0) - 1),
        }))
        return
      }

      applyRow(data as SongStatRow)
    },
    [likedIds, applyRow],
  )

  const recordShare = useCallback(
    async (songId: string) => {
      setShareCounts((prev) => {
        const next = { ...prev, [songId]: (prev[songId] ?? 0) + 1 }
        if (!hasCloudStats) {
          const stats = readLocalStats()
          stats.shares = next
          writeLocalStats(stats)
        }
        return next
      })

      const supabase = getSupabase()
      if (!supabase) return

      const { data, error } = await supabase.rpc('song_share', {
        p_song_id: songId,
      })
      if (error) {
        console.warn('Share sync failed:', error.message)
        return
      }
      applyRow(data as SongStatRow)
    },
    [applyRow],
  )

  return {
    isLiked,
    getLikeCount,
    getShareCount,
    toggleLike,
    recordShare,
    ready,
    isGlobal: hasCloudStats,
  }
}
