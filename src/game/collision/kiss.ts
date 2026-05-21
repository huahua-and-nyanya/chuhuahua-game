import {
  GAME_HEIGHT,
  GAME_WIDTH,
  KISS_DEBOUNCE,
  KISS_DIST,
  KISS_DURATION,
  KISS_PUSH,
  MWAH_DURATION,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'

// 카드 안전 마진 — cat이 화면 벽 너무 가깝지 않게.
const SCREEN_MARGIN = 60
// 우세 축이 가장자리로 막혔다고 판단하는 최소 이동 거리 (KISS_PUSH의 절반 미만이면 막힘).
const MIN_PUSH_DIST = KISS_PUSH / 2

// 우세 축(chi 반대 방향) 기준 cat의 도망 목표점. 가장자리로 잘려서 거의 안 움직이면 null.
function computeTarget(
  catX: number,
  catY: number,
  dxk: number,
  dyk: number,
  useHorizontal: boolean,
): { x: number; y: number } | null {
  // sign(0) = 0 → 임의 방향(1) 폴백. chi가 cat과 같은 축이면 어디로 가든 OK.
  const signX = Math.sign(dxk) || 1
  const signY = Math.sign(dyk) || 1
  const pushDx = useHorizontal ? -signX * KISS_PUSH : 0
  const pushDy = useHorizontal ? 0 : -signY * KISS_PUSH
  const x = clamp(catX + pushDx, SCREEN_MARGIN, GAME_WIDTH - SCREEN_MARGIN)
  const y = clamp(catY + pushDy, SCREEN_MARGIN, GAME_HEIGHT - SCREEN_MARGIN)
  return Math.hypot(x - catX, y - catY) < MIN_PUSH_DIST ? null : { x, y }
}

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

  // "통통 부끄러워서 도망" — chi 위치 기준 4방향(상/하/좌/우) 우세 축으로 도망 지점 결정.
  // cat 좌표는 직접 안 건드림 → cat-flee의 lerp가 매끄럽게 catTarget으로 이동.
  // 우세 축이 가장자리로 막히면(cat이 벽에 붙은 채 chi가 반대편) 다른 축으로 폴백.
  // 두 축 다 막힌 코너 케이스는 cat이 그 자리 유지 (catTarget 변경 X).
  // 시각 통통(2번 점프)은 solo.tsx의 kiss-bounce keyframe이 책임.
  const useHorizontal = Math.abs(dxk) >= Math.abs(dyk)
  const target =
    computeTarget(cat.x, cat.y, dxk, dyk, useHorizontal) ??
    computeTarget(cat.x, cat.y, dxk, dyk, !useHorizontal)
  if (target !== null) {
    refs.ai.catTarget = target
  }

  onKiss(prevLastKissAt)
}
