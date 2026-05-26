import { PVP_HISTORY_MAX, STORAGE_KEY_PVP_HISTORY } from '@/game/constants'

import type { PvpEntry } from './types'

// localStorage I/O. JSON parse/quota 실패는 빈 배열 폴백 (오프라인 폴백 정책).
// 정렬 규칙: date DESC (최신 위). 동점/같은 ms는 unshift 순서 그대로 (안정 정렬).

export function loadPvpHistory(): PvpEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PVP_HISTORY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as PvpEntry[]
  } catch {
    return []
  }
}

export function savePvpHistory(entries: PvpEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PVP_HISTORY, JSON.stringify(entries))
  } catch {
    // quota exceeded / private mode 등 — 무시 (오프라인 폴백)
  }
}

// 새 entry를 최신 위(unshift)로 삽입 후 PVP_HISTORY_MAX 컷. 반환은 갱신된 전체 list.
export function addPvpEntry(entry: PvpEntry): PvpEntry[] {
  const list = loadPvpHistory()
  list.unshift(entry)
  const trimmed = list.slice(0, PVP_HISTORY_MAX)
  savePvpHistory(trimmed)
  return trimmed
}

export function clearPvpHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PVP_HISTORY)
  } catch {
    // 무시
  }
}
