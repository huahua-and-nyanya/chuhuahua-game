import { HISTORY_MAX, STORAGE_KEY_HISTORY } from '@/game/constants'

import { RANK_TOP_N, type SoloEntry } from './types'

// localStorage I/O. JSON parse/quota 실패는 빈 배열 폴백 (오프라인 폴백 정책).
// 정렬 규칙: score DESC, 동점 시 date ASC (먼저 달성한 사람이 위).

export function loadHistory(): SoloEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SoloEntry[]
  } catch {
    return []
  }
}

export function saveHistory(entries: SoloEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(entries))
  } catch {
    // quota exceeded / private mode 등 — 무시 (오프라인 폴백)
  }
}

// 새 entry를 정렬된 list에 삽입 후 HISTORY_MAX 컷. 반환은 갱신된 전체 list.
export function addEntry(entry: SoloEntry): SoloEntry[] {
  const list = loadHistory()
  list.push(entry)
  list.sort((a, b) => b.score - a.score || a.date - b.date)
  const trimmed = list.slice(0, HISTORY_MAX)
  saveHistory(trimmed)
  return trimmed
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY)
  } catch {
    // 무시
  }
}

// score가 entries 안에서 몇 위에 들지 계산 (1-based). TOP N 초과면 null.
// 가상의 entry라서 동점은 "더 나중에 추가됐다" 가정 → 같은 score는 본인 뒤에.
export function getRank(
  score: number,
  entries: SoloEntry[] = loadHistory(),
): number | null {
  let rank = 1
  for (const e of entries) {
    if (e.score > score) rank++
  }
  return rank > RANK_TOP_N ? null : rank
}
