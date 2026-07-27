import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'heartstrings-likes'

function readLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

function writeLikes(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // private mode / quota — ignore
  }
}

/** Persist liked song ids in the visitor's browser (local only). */
export function useLikes() {
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setLikedIds(readLikes())
  }, [])

  const isLiked = useCallback(
    (songId: string) => likedIds.has(songId),
    [likedIds],
  )

  const toggleLike = useCallback((songId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(songId)) next.delete(songId)
      else next.add(songId)
      writeLikes(next)
      return next
    })
  }, [])

  return { isLiked, toggleLike, likedCount: likedIds.size }
}
