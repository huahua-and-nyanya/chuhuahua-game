import {
  GAME_HEIGHT,
  GAME_SPEED_MUL,
  GAME_WIDTH,
  MAX_FRAME_SCALE,
  PHYSICS_FRAME_MS,
} from './constants'

// === 거리 / 각도 ===

export function distance(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = ax - bx
  const dy = ay - by
  return Math.sqrt(dx * dx + dy * dy)
}

export function angle(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): number {
  return Math.atan2(toY - fromY, toX - fromX)
}

// === 보간 / 제한 ===

export function clamp(v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v
}

// t는 0~1 가정, 클램프 안 함 (호출 측 책임)
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// 프레임률 독립 스케일 × 게임 속도 배율 — dt(ms)를 60fps 프레임 기준 배수로 환산 후 GAME_SPEED_MUL 곱.
// 위치(x += vx * s)와 lerp 가속(v += (target-v)*k*s)에 곱해 저fps 슬로우모션 보정 + 전반 속도 조정.
// dt 비율은 MAX_FRAME_SCALE로 상한 — dt 폭주(탭 복귀/심한 끊김) 시 순간이동·충돌 터널링 방지.
export function frameScale(dt: number): number {
  return clamp(dt / PHYSICS_FRAME_MS, 0, MAX_FRAME_SCALE) * GAME_SPEED_MUL
}

// === 충돌 ===

export function circleCollide(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  return distance(ax, ay, bx, by) < ar + br
}

// padding만큼 안쪽으로 clamp
export function rectClamp(
  x: number,
  y: number,
  padding = 0,
): { x: number; y: number } {
  return {
    x: clamp(x, padding, GAME_WIDTH - padding),
    y: clamp(y, padding, GAME_HEIGHT - padding),
  }
}
