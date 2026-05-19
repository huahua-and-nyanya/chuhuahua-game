import { GAME_HEIGHT, GAME_WIDTH } from './constants'

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
