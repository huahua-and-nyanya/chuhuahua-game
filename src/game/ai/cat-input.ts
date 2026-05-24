import { ACCEL, GAME_HEIGHT, GAME_WIDTH, MAX_SPEED } from '@/game/constants'
import { getCatSpeedMul } from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'

import { isKeyDown } from './chi-input'

// reference 1643~1671 정확 이식.
// PvP 전용 — 화살표 키로 cat을 직접 조작. 츄와와와 동일한 ACCEL lerp 가속도 시스템.
// 솔로에선 cat-flee.ts(AI lerp)가 cat을 움직이므로 본 함수를 호출하지 않는다.
//
// 동적 clamp margin (reference 1668):
//   shield 활성 → 130
//   slow 활성 → 50
//   spedUp(cucumber) 활성 → 70
//   평소 → 50
//
// facing (reference 1651~1653):
//   default 1 상태에서 cat이 좌측 보고 있음.
//   ctvx > 0 (우측 이동) → -1 (scaleX(-1)로 flip)
//   ctvx < 0 (좌측 이동) → 1 (그대로)
const CAT_MARGIN_SHIELD = 130
const CAT_MARGIN_SLOW = 50
const CAT_MARGIN_SPEDUP = 70
const CAT_MARGIN_DEFAULT = 50
const FACING_DEADZONE = 0

export function applyCatPvpPhysics(
  refs: GameRefs,
  now: number,
  dt: number,
): void {
  void dt
  const cat = refs.cat

  let ctvx = 0
  let ctvy = 0
  if (isKeyDown('arrowleft')) ctvx -= 1
  if (isKeyDown('arrowright')) ctvx += 1
  if (isKeyDown('arrowup')) ctvy -= 1
  if (isKeyDown('arrowdown')) ctvy += 1

  // facing — Chihuahua와 동일 규약(facing='right'면 컨테이너에서 scaleX(-1) 처리).
  if (ctvx > FACING_DEADZONE) cat.facing = 'right'
  else if (ctvx < -FACING_DEADZONE) cat.facing = 'left'

  // cucumber(catSpeedup) / sweetPotato(catSlow) 곱셈은 effects 헬퍼로 일원화.
  // reference 1656~1657과 동일 결과.
  const speed = MAX_SPEED * getCatSpeedMul(refs, now)

  const clen = Math.hypot(ctvx, ctvy)
  if (clen > 0) {
    ctvx = (ctvx / clen) * speed
    ctvy = (ctvy / clen) * speed
  }

  cat.vx += (ctvx - cat.vx) * ACCEL
  cat.vy += (ctvy - cat.vy) * ACCEL

  if (Math.abs(cat.vx) < 0.05) cat.vx = 0
  if (Math.abs(cat.vy) < 0.05) cat.vy = 0

  const shieldOn = refs.effects.catShield.until > now
  const slowOn = refs.effects.catSlow.until > now
  const spedUpOn = refs.effects.catSpeedup.until > now
  const margin = shieldOn
    ? CAT_MARGIN_SHIELD
    : slowOn
      ? CAT_MARGIN_SLOW
      : spedUpOn
        ? CAT_MARGIN_SPEDUP
        : CAT_MARGIN_DEFAULT

  let cnx = cat.x + cat.vx
  let cny = cat.y + cat.vy
  if (cnx < margin || cnx > GAME_WIDTH - margin) {
    cnx = clamp(cnx, margin, GAME_WIDTH - margin)
    cat.vx = 0
  }
  if (cny < margin || cny > GAME_HEIGHT - margin) {
    cny = clamp(cny, margin, GAME_HEIGHT - margin)
    cat.vy = 0
  }
  cat.x = cnx
  cat.y = cny
}
