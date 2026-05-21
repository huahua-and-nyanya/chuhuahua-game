import {
  CAT_DASH_COOLDOWN,
  CAT_DASH_DIST,
  CAT_DASH_THRESHOLD,
  CAT_FLEE_LERP_MUL,
  CAT_FLEE_RANGE,
  CAT_LERP_BASE,
  CAT_LERP_PER_LEVEL,
  GAME_HEIGHT,
  GAME_WIDTH,
  KISS_DIST,
} from '@/game/constants'
import { getCatSpeedMul } from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'

// reference 1728: dash 발동 최소 레벨.
const DASH_MIN_LEVEL = 2
// reference 1688: 비둘기 회피 시 lookahead 거리.
const PIGEON_FLEE_LOOKAHEAD = 90
// reference 1688: 화면 안 안전 margin.
const SCREEN_MARGIN = 60
// reference 1719/1732: dash 발동 하한 (이 거리보다 가까우면 의미 없음).
const DASH_MIN_CHI_DIST = KISS_DIST + 6

// reference 1672~1745 솔로 cat AI:
// 1순위 — 비둘기 회피 (220px 내 가장 가까운 flying 비둘기 반대 90px + lerp 절반)
// 2순위 — cucumber 도망 패턴: 솔로엔 cucumber 자체가 안 나오므로 dead branch (C-3'에서 통합)
// 3순위 — LV2+ dash: chi 80px 접근 + 쿨다운 통과 시 130px 점프 후 catTarget 갱신
// 기본 — ai.catTarget(wandering 목표점)으로 lerp
//
// dt 인자는 호환용으로만 받음. RAF 60fps 가정으로 lerp 자체가 프레임 비례.
export function updateCatFlee(
  refs: GameRefs,
  level: number,
  now: number,
  dt: number,
): void {
  void dt
  const { cat, chi, pigeons, ai } = refs
  const baseLerp = CAT_LERP_BASE + level * CAT_LERP_PER_LEVEL
  let activeLerp = baseLerp
  let target = ai.catTarget

  // 1. 비둘기 회피
  const flying = pigeons.filter((p) => p.state === 'flying')
  if (flying.length > 0) {
    let closest = null
    let minD = Infinity
    for (const p of flying) {
      const d = Math.hypot(cat.x - p.x, cat.y - p.y)
      if (d < minD && d < CAT_FLEE_RANGE) {
        minD = d
        closest = p
      }
    }
    if (closest !== null) {
      const dxp = cat.x - closest.x
      const dyp = cat.y - closest.y
      const len = minD || 1
      target = {
        x: clamp(
          cat.x + (dxp / len) * PIGEON_FLEE_LOOKAHEAD,
          SCREEN_MARGIN,
          GAME_WIDTH - SCREEN_MARGIN,
        ),
        y: clamp(
          cat.y + (dyp / len) * PIGEON_FLEE_LOOKAHEAD,
          SCREEN_MARGIN,
          GAME_HEIGHT - SCREEN_MARGIN,
        ),
      }
      activeLerp = baseLerp * CAT_FLEE_LERP_MUL
    }
  } else if (level >= DASH_MIN_LEVEL) {
    // 2. (cucumber dead branch는 C-3'에서)
    // 3. LV2+ dash
    const dxChi = cat.x - chi.x
    const dyChi = cat.y - chi.y
    const dChi = Math.hypot(dxChi, dyChi)
    if (
      dChi < CAT_DASH_THRESHOLD &&
      dChi > DASH_MIN_CHI_DIST &&
      now > ai.cat.lastDashAt
    ) {
      const ll = dChi || 1
      const dashTarget = {
        x: clamp(
          cat.x + (dxChi / ll) * CAT_DASH_DIST,
          SCREEN_MARGIN,
          GAME_WIDTH - SCREEN_MARGIN,
        ),
        y: clamp(
          cat.y + (dyChi / ll) * CAT_DASH_DIST,
          SCREEN_MARGIN,
          GAME_HEIGHT - SCREEN_MARGIN,
        ),
      }
      // catTarget도 dash 목표점으로 갱신 — 다음 wandering tick까지 그 위치 유지.
      ai.catTarget = dashTarget
      target = dashTarget
      // "다음 dash 가능 시각"을 lastDashAt에 저장 (now > 비교 패턴).
      ai.cat.lastDashAt = now + CAT_DASH_COOLDOWN
    }
  }

  // cucumber 가속 / sweetPotato 슬로우 곱셈을 effects에서 읽어 적용.
  // 솔로엔 둘 다 안 스폰되므로 PvP F에서만 실제 영향.
  const speedMul = getCatSpeedMul(refs, now)
  cat.x += (target.x - cat.x) * activeLerp * speedMul
  cat.y += (target.y - cat.y) * activeLerp * speedMul

  // facing — 시선은 chi 추적 (PvP에선 본 분기 사용 안 함).
  if (chi.x > cat.x + 5) cat.facing = 'right'
  else if (chi.x < cat.x - 5) cat.facing = 'left'
}
