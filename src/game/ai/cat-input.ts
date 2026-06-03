import { ACCEL, GAME_HEIGHT, GAME_WIDTH, MAX_SPEED } from '@/game/constants'
import { getCatSpeedMul } from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import { clamp, frameScale } from '@/game/physics'

import { isKeyDown, type VirtualInputState } from './chi-input'

// PvP 모바일 — cat 전용 가상 입력 채널(D-pad). chi-input의 virtualInputRef와 대칭 패턴.
// VirtualController가 PvP에서 D-pad press/release를 setVirtualCatInput으로 보낸다.
// applyCatPvpPhysics가 매 프레임 키보드 화살표와 OR로 읽음.
const virtualCatInputRef = {
  current: {
    up: false,
    down: false,
    left: false,
    right: false,
  } as VirtualInputState,
}

export function setVirtualCatInput(state: VirtualInputState): void {
  virtualCatInputRef.current = state
}

// reference 1643~1671 정확 이식.
// PvP 전용 — 화살표 키로 cat을 직접 조작. 츄와와와 동일한 ACCEL lerp 가속도 시스템.
// 솔로에선 cat-flee.ts(AI lerp)가 cat을 움직이므로 본 함수를 호출하지 않는다.
//
// 동적 clamp margin:
//   slow 활성 → 50
//   spedUp(cucumber) 활성 → 70
//   평소 → 50
// 쉴드는 별도 margin 없음 — 쉴드 버블(ShieldBubble)은 pointer-events-none 시각 오버레이라
// cat 이동을 가둘 이유가 없다. 과거 130 margin이 쉴드 시 좌우 끝까지 못 가는 버그를 만들었다.
//
// facing (reference 1651~1653):
//   default 1 상태에서 cat이 좌측 보고 있음.
//   ctvx > 0 (우측 이동) → -1 (scaleX(-1)로 flip)
//   ctvx < 0 (좌측 이동) → 1 (그대로)
const CAT_MARGIN_SLOW = 50
const CAT_MARGIN_SPEDUP = 70
const CAT_MARGIN_DEFAULT = 50
const FACING_DEADZONE = 0

export function applyCatPvpPhysics(
  refs: GameRefs,
  now: number,
  dt: number,
): void {
  const s = frameScale(dt)
  const cat = refs.cat

  // PvP에선 cat = 화살표 키 + (모바일) D-pad 가상 입력 OR. 둘 다 같은 방향 신호 동등.
  const vcat = virtualCatInputRef.current
  let ctvx = 0
  let ctvy = 0
  if (isKeyDown('arrowleft') || vcat.left) ctvx -= 1
  if (isKeyDown('arrowright') || vcat.right) ctvx += 1
  if (isKeyDown('arrowup') || vcat.up) ctvy -= 1
  if (isKeyDown('arrowdown') || vcat.down) ctvy += 1

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

  cat.vx += (ctvx - cat.vx) * ACCEL * s
  cat.vy += (ctvy - cat.vy) * ACCEL * s

  if (Math.abs(cat.vx) < 0.05) cat.vx = 0
  if (Math.abs(cat.vy) < 0.05) cat.vy = 0

  const slowOn = refs.effects.catSlow.until > now
  const spedUpOn = refs.effects.catSpeedup.until > now
  const margin = slowOn
    ? CAT_MARGIN_SLOW
    : spedUpOn
      ? CAT_MARGIN_SPEDUP
      : CAT_MARGIN_DEFAULT

  let cnx = cat.x + cat.vx * s
  let cny = cat.y + cat.vy * s
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
