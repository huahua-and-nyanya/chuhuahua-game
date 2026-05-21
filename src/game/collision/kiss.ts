import {
  GAME_HEIGHT,
  GAME_WIDTH,
  KISS_DIST,
  KISS_DURATION,
  KISS_PUSH,
  MWAH_DURATION,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'

// reference 1773~1825 이식. KISS_DIST(42) 내로 들어오면 뽀뽀 트리거.
// 재트리거는 kissing.until 가드(380ms)와 cat 25px 푸시로 막는다.
// 솔로엔 catShield가 fish로만 부여되고 그 동안 뽀뽀 차단 X — reference 1779의 PvP 한정 분기 패턴 따름.

const SCREEN_MARGIN = 60

export type KissDeps = {
  refs: GameRefs
  now: number
  onKiss: () => void
}

export function checkKiss(deps: KissDeps): void {
  const { refs, now, onKiss } = deps
  const chi = refs.chi
  const cat = refs.cat

  // 이미 뽀뽀 가드 중이면 재트리거 X.
  if (refs.kissing.active && refs.kissing.until > now) return

  const dxk = chi.x - cat.x
  const dyk = chi.y - cat.y
  const dk = Math.hypot(dxk, dyk)
  if (dk >= KISS_DIST) return

  refs.kissing = { active: true, until: now + KISS_DURATION }
  const cx = (chi.x + cat.x) / 2
  const cy = (chi.y + cat.y) / 2 - 16
  refs.mwah = { active: true, until: now + MWAH_DURATION, x: cx, y: cy - 12 }

  // cat을 chi 반대로 25px 푸시 (KISS_PUSH). 재트리거 가드의 보조.
  const len = dk || 1
  cat.x = clamp(
    cat.x - (dxk / len) * KISS_PUSH,
    SCREEN_MARGIN,
    GAME_WIDTH - SCREEN_MARGIN,
  )
  cat.y = clamp(
    cat.y - (dyk / len) * KISS_PUSH,
    SCREEN_MARGIN,
    GAME_HEIGHT - SCREEN_MARGIN,
  )

  onKiss()
}
