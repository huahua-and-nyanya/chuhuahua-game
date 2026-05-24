import { MAX_PARTICLES } from './constants'
import type { ParticleRef } from './state'

// 파티클 시스템 — in-place mutation 패턴.
// add: 새 파티클 push, MAX 초과 시 가장 오래된 것부터 splice.
// update: 매 RAF(60fps) 호출. 중력/마찰 적용 + life=0이면 splice.

const GRAVITY = 0.3 // px/frame²
const FRICTION = 0.96 // vx 감쇠 계수

export function addParticles(arr: ParticleRef[], newOnes: ParticleRef[]): void {
  if (newOnes.length === 0) return
  for (const p of newOnes) arr.push(p)
  if (arr.length > MAX_PARTICLES) {
    arr.splice(0, arr.length - MAX_PARTICLES)
  }
}

export function updateParticles(arr: ParticleRef[]): void {
  for (let i = arr.length - 1; i >= 0; i--) {
    const p = arr[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += GRAVITY
    p.vx *= FRICTION
    p.rot += p.vr
    p.life -= 1
    if (p.life <= 0) {
      arr.splice(i, 1)
    }
  }
}
