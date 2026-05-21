import {
  KISS_DEBOUNCE,
  KISS_DIST,
  KISS_DURATION,
  MWAH_DURATION,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'

// reference 1773~1825 이식. KISS_DIST(42) 내로 들어오면 뽀뽀 트리거.
// 재트리거 가드는 reference 1776의 600ms 디바운스 — scoreMirror.lastKissAt 비교.
// 솔로엔 catShield가 fish로만 부여되고 그 동안 뽀뽀 차단 X (reference 1779의 PvP 한정 분기 패턴).

// onKiss는 갱신 직전의 lastKissAt 값을 받는다 — applyScore가 콤보 윈도우 계산에 사용.
// kiss.ts에서 lastKissAt을 먼저 갱신해버리면 score.ts에서 항상 `now - now = 0 < 2400`이 돼
// 콤보가 영원히 끊기지 않는 버그가 나므로, prev 값을 콜백에 명시 전달한다.
export type KissDeps = {
  refs: GameRefs
  now: number
  onKiss: (prevLastKissAt: number) => void
}

export function checkKiss(deps: KissDeps): void {
  const { refs, now, onKiss } = deps
  const chi = refs.chi
  const cat = refs.cat

  // 600ms 디바운스 — kissing 가드보다 먼저 (디바운스가 더 정확한 재트리거 차단).
  if (now - refs.scoreMirror.lastKissAt < KISS_DEBOUNCE) return

  const dxk = chi.x - cat.x
  const dyk = chi.y - cat.y
  const dk = Math.hypot(dxk, dyk)
  if (dk >= KISS_DIST) return

  refs.kissing = { active: true, until: now + KISS_DURATION }
  const cx = (chi.x + cat.x) / 2
  const cy = (chi.y + cat.y) / 2 - 16
  refs.mwah = { active: true, until: now + MWAH_DURATION, x: cx, y: cy - 12 }

  // 갱신 직전 값을 콜백에 넘긴 뒤 디바운스용 타임스탬프 즉시 갱신.
  const prevLastKissAt = refs.scoreMirror.lastKissAt
  refs.scoreMirror.lastKissAt = now

  onKiss(prevLastKissAt)
}
