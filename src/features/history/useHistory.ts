import { useCallback, useState } from 'react'

import {
  addEntry,
  clearHistory as clearLS,
  getRank as getRankLS,
  loadHistory,
} from './storage'
import type { SoloEntry, SoloEntryInput } from './types'

// 컴포넌트는 backend 직접 import 금지 — 본 훅 경유. (CLAUDE.md 모듈 경계)
// 현재는 localStorage 백엔드만, 추후 Supabase 동기화 시 본 훅 안에서 분기.
export type UseHistoryReturn = {
  entries: SoloEntry[]
  save: (input: SoloEntryInput) => SoloEntry
  clear: () => void
  getRank: (score: number) => number | null
}

export function useHistory(): UseHistoryReturn {
  const [entries, setEntries] = useState<SoloEntry[]>(() => loadHistory())

  const save = useCallback((input: SoloEntryInput): SoloEntry => {
    const entry: SoloEntry = {
      id: crypto.randomUUID(),
      date: Date.now(),
      ...input,
    }
    const next = addEntry(entry)
    setEntries(next)
    return entry
  }, [])

  const clear = useCallback(() => {
    clearLS()
    setEntries([])
  }, [])

  // 등록 전 점수의 예상 순위. entries 의존이라 entries 변경 시 새 클로저.
  const getRank = useCallback(
    (score: number) => getRankLS(score, entries),
    [entries],
  )

  return { entries, save, clear, getRank }
}
