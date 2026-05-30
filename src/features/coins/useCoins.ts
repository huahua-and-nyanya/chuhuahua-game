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

  // localStorage 재읽기 — solo의 earnCoins(별도 useWardrobe 인스턴스)가 같은 키를
  // 갱신해도 이 훅 state는 안 바뀌므로, 라우트 복귀 시 호출해 최신값으로 동기화.
  const refresh = useCallback(() => setCoins(readStoredCoins()), [])

  return { coins, addCoins, refresh }
}
