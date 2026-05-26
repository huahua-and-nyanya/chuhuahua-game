import { useCallback, useState } from 'react'

import {
  addPvpEntry,
  clearPvpHistory as clearLS,
  loadPvpHistory,
} from './storage'
import type { PvpEntry, PvpEntryInput } from './types'

// 컴포넌트는 storage 직접 import 금지 — 본 훅 경유. (CLAUDE.md 모듈 경계)
// 솔로 useHistory와 동일 패턴. 현재 localStorage 백엔드만, 추후 Supabase 동기화 시 본 훅 안에서 분기.

export type UsePvpHistoryReturn = {
  entries: PvpEntry[]
  save: (input: PvpEntryInput) => PvpEntry
  clear: () => void
}

export function usePvpHistory(): UsePvpHistoryReturn {
  const [entries, setEntries] = useState<PvpEntry[]>(() => loadPvpHistory())

  const save = useCallback((input: PvpEntryInput): PvpEntry => {
    const entry: PvpEntry = {
      id: crypto.randomUUID(),
      date: Date.now(),
      ...input,
    }
    const next = addPvpEntry(entry)
    setEntries(next)
    return entry
  }, [])

  const clear = useCallback(() => {
    clearLS()
    setEntries([])
  }, [])

  return { entries, save, clear }
}
