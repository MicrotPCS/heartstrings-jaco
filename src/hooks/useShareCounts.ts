import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'heartstrings-share-counts'

type CountMap = Record<string, number>

function readCounts(): CountMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: CountMap = {}
    for (const [id, n] of Object.entries(parsed as CountMap)) {
      if (typeof n === 'number' && n >= 0) out[id] = Math.floor(n)
    }
    return out
  } catch {
    return {}
  }
}

function writeCounts(map: CountMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // private mode / quota
  }
}

/** Per-song share totals for this browser (localStorage). */
export function useShareCounts() {
  const [counts, setCounts] = useState<CountMap>({})

  useEffect(() => {
    setCounts(readCounts())
  }, [])

  const getShareCount = useCallback(
    (songId: string) => counts[songId] ?? 0,
    [counts],
  )

  const recordShare = useCallback((songId: string) => {
    setCounts((prev) => {
      const next = { ...prev, [songId]: (prev[songId] ?? 0) + 1 }
      writeCounts(next)
      return next
    })
  }, [])

  return { getShareCount, recordShare }
}
