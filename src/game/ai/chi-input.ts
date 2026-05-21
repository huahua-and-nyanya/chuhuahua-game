import { useEffect } from 'react'

import { ACCEL, GAME_HEIGHT, GAME_WIDTH, MAX_SPEED } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'

// reference 739: keysRef.current = {} 패턴 그대로.
// 모듈 스코프 단일 인스턴스 — 사이클 C 제약(동시 게임 1개)과 일관.
// PvP에서 chi/cat 키 분리는 사이클 F 책임.
const keysRef = { current: {} as Record<string, boolean> }

// 마진 — slow 활성 시 큰 캐릭터 크기 대응 (reference 1633: slow ? 65 : 50).
// slow 효과 읽기는 C-3'에서 effects 통합 시 추가. 현재는 평소값 50 하드코딩.
const CHI_MARGIN_NORMAL = 50
// 캐릭터가 좌측을 기본으로 그려져있어 facing='right'면 horizontal flip이 필요.
const FACING_DEADZONE = 0

export type ChiInputDeps = {
  refs: GameRefs
  enabled: () => boolean
}

// keydown/keyup으로 keysRef를 갱신. 매 프레임 applyChiPhysics가 읽어 가속을 적용한다.
// reference 1153~1200 패턴: input/textarea 포커스 중엔 무시, 화살표/WASD/스페이스는 preventDefault.
export function useChiInput(deps: ChiInputDeps): void {
  const { enabled } = deps

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }
      // enabled가 false면 stale 키 잔여 방지 차원에서 keysRef 리셋 후 무시.
      if (!enabled()) {
        keysRef.current = {}
        return
      }
      const k = e.key.toLowerCase()
      keysRef.current[k] = true
      if (
        [
          'arrowup',
          'arrowdown',
          'arrowleft',
          'arrowright',
          'w',
          'a',
          's',
          'd',
          ' ',
        ].includes(k)
      ) {
        e.preventDefault()
      }
    }
    const handleUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      keysRef.current[k] = false
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      keysRef.current = {}
    }
    // enabled는 ref-shaped 함수로 받아 동일 참조 유지 가정. mount/unmount만 트리거.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// reference 1599~1636 정확 이식. dt 인자는 호환용으로만 받고 본문에선 미사용
// (RAF 60fps 가정으로 위치 += vx 그대로 더한다). getLevel도 C-3'에서 effects 통합 시 사용.
export function applyChiPhysics(
  refs: GameRefs,
  dt: number,
  getLevel: () => number,
): void {
  void dt
  void getLevel
  const k = keysRef.current
  const chi = refs.chi

  // 솔로 = WASD + 방향키 OR. PvP에선 chi가 WASD 전용이지만 사이클 F 책임.
  let tvx = 0
  let tvy = 0
  if (k['a'] || k['arrowleft']) tvx -= 1
  if (k['d'] || k['arrowright']) tvx += 1
  if (k['w'] || k['arrowup']) tvy -= 1
  if (k['s'] || k['arrowdown']) tvy += 1

  // facing — 좌우 입력만 기준 (수직 입력은 방향 안 바꿈).
  if (tvx > FACING_DEADZONE) chi.facing = 'right'
  else if (tvx < -FACING_DEADZONE) chi.facing = 'left'

  // TODO C-3': boost/slow를 effects에서 읽어 boostMul/slowMul 적용.
  const boostMul = 1
  const speed = MAX_SPEED * boostMul

  const len = Math.hypot(tvx, tvy)
  if (len > 0) {
    tvx = (tvx / len) * speed
    tvy = (tvy / len) * speed
  }

  // lerp 적용. reference 1625-1626 그대로 — ACCEL 배수, dt 정규화 X.
  chi.vx += (tvx - chi.vx) * ACCEL
  chi.vy += (tvy - chi.vy) * ACCEL

  // 미세 속도 dead-zone (reference 1627-1628).
  if (Math.abs(chi.vx) < 0.05) chi.vx = 0
  if (Math.abs(chi.vy) < 0.05) chi.vy = 0

  // 위치 갱신 + 동적 clamp. slow 분기는 C-3'에서.
  const margin = CHI_MARGIN_NORMAL
  let nx = chi.x + chi.vx
  let ny = chi.y + chi.vy
  if (nx < margin || nx > GAME_WIDTH - margin) {
    nx = clamp(nx, margin, GAME_WIDTH - margin)
    chi.vx = 0
  }
  if (ny < margin || ny > GAME_HEIGHT - margin) {
    ny = clamp(ny, margin, GAME_HEIGHT - margin)
    chi.vy = 0
  }
  chi.x = nx
  chi.y = ny
}
