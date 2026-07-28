import { useCallback, useEffect, useState } from 'react'
import {
  asSongStatRow,
  getSupabase,
  hasCloudStats,
  initCloudStats,
  type SongStatRow,
} from '../lib/supabase'

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
 * Global likes & shares when Supabase is configured
 * (env vars or /stats-config.json). Otherwise local-only.
 */
export function useSongStats() {
  const [likeCounts, setLikeCounts] = useState<CountMap>({})
  const [shareCounts, setShareCounts] = useState<CountMap>({})
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())
  const [ready, setReady] = useState(false)
  const [isGlobal, setIsGlobal] = useState(false)

  useEffect(() => {
    setLikedIds(readLikedIds())
    let cancelled = false
    let channel: ReturnType<
      NonNullable<ReturnType<typeof getSupabase>>['channel']
    > | null = null

    async function boot() {
      const ok = await initCloudStats()
      if (cancelled) return
      setIsGlobal(ok)

      const supabase = getSupabase()
      if (!supabase || !ok) {
        const local = readLocalStats()
        setLikeCounts(local.likes)
        setShareCounts(local.shares)
        setReady(true)
        return
      }

      const { data, error } = await supabase
        .from('song_stats')
        .select('song_id, likes, shares')

      if (cancelled) return
      if (error) {
        console.warn('Could not load song stats:', error.message)
        setIsGlobal(false)
        const local = readLocalStats()
        setLikeCounts(local.likes)
        setShareCounts(local.shares)
        setReady(true)
        return
      }

      const maps = rowsToMaps((data ?? []) as SongStatRow[])
      setLikeCounts(maps.likes)
      setShareCounts(maps.shares)
      setReady(true)

      channel = supabase
        .channel('song_stats_live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'song_stats' },
          (payload) => {
            const row = asSongStatRow(payload.new ?? payload.old)
            if (!row) return
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
            setLikeCounts((p) => ({ ...p, [row.song_id]: row.likes }))
            setShareCounts((p) => ({ ...p, [row.song_id]: row.shares }))
          },
        )
        .subscribe()
    }

    void boot()

    return () => {
      cancelled = true
      const supabase = getSupabase()
      if (supabase && channel) void supabase.removeChannel(channel)
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

  const applyRow = useCallback((data: unknown) => {
    const row = asSongStatRow(data)
    if (!row) return
    setLikeCounts((p) => ({ ...p, [row.song_id]: row.likes }))
    setShareCounts((p) => ({ ...p, [row.song_id]: row.shares }))
  }, [])

  const toggleLike = useCallback(
    async (songId: string) => {
      const wasLiked = likedIds.has(songId)
      const nextLiked = new Set(likedIds)
      if (wasLiked) nextLiked.delete(songId)
      else nextLiked.add(songId)

      setLikedIds(nextLiked)
      writeLikedIds(nextLiked)

      const cloud = hasCloudStats()
      setLikeCounts((prev) => {
        const current = prev[songId] ?? 0
        const next = {
          ...prev,
          [songId]: wasLiked ? Math.max(0, current - 1) : current + 1,
        }
        if (!cloud) {
          const stats = readLocalStats()
          stats.likes = next
          writeLocalStats(stats)
        }
        return next
      })

      const supabase = getSupabase()
      if (!supabase || !cloud) return

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

      applyRow(data)
    },
    [likedIds, applyRow],
  )

  const recordShare = useCallback(
    async (songId: string) => {
      const cloud = hasCloudStats()
      setShareCounts((prev) => {
        const next = { ...prev, [songId]: (prev[songId] ?? 0) + 1 }
        if (!cloud) {
          const stats = readLocalStats()
          stats.shares = next
          writeLocalStats(stats)
        }
        return next
      })

      const supabase = getSupabase()
      if (!supabase || !cloud) return

      const { data, error } = await supabase.rpc('song_share', {
        p_song_id: songId,
      })
      if (error) {
        console.warn('Share sync failed:', error.message)
        return
      }
      applyRow(data)
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
    isGlobal,
  }
}
