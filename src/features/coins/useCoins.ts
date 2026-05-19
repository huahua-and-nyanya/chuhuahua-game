import { useCallback, useState } from 'react'

const COIN_KEY = 'chuhuahua:coins'

function readStoredCoins(): number {
  if (typeof window === 'undefined') return 0
  const stored = window.localStorage.getItem(COIN_KEY)
  if (stored === null) return 0
  const parsed = Number(stored)
  return Number.isFinite(parsed) ? parsed : 0
}

export function useCoins() {
  const [coins, setCoins] = useState<number>(readStoredCoins)

  const addCoins = useCallback((delta: number) => {
    setCoins((prev) => {
      const next = prev + delta
      window.localStorage.setItem(COIN_KEY, String(next))
      return next
    })
  }, [])

  return { coins, addCoins }
}
