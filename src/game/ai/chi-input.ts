import { useEffect } from 'react'

import { ACCEL, GAME_HEIGHT, GAME_WIDTH, MAX_SPEED } from '@/game/constants'
import { getChiSpeedMul } from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'

// reference 739: keysRef.current = {} 패턴 그대로.
// 모듈 스코프 단일 인스턴스 — 사이클 C 제약(동시 게임 1개)과 일관.
// PvP에서 chi는 WASD 전용, cat은 화살표 전용 (applyChiPhysics / cat-input.ts에서 분기).
const keysRef = { current: {} as Record<string, boolean> }

// cat-input.ts 등 같은 입력 소스를 쓰는 모듈에서 키 상태를 조회하기 위한 readonly 헬퍼.
export function isKeyDown(key: string): boolean {
  return Boolean(keysRef.current[key])
}

// 마진 — slow 활성 시 큰 캐릭터 크기 대응 (reference 1633: slow ? 65 : 50).
const CHI_MARGIN_NORMAL = 50
const CHI_MARGIN_SLOW = 65
// 캐릭터가 좌측을 기본으로 그려져있어 facing='right'면 horizontal flip이 필요.
const FACING_DEADZONE = 0

// 모바일 가상 컨트롤러가 매 프레임 주입하는 4방향 boolean 묶음.
// 키보드 keysRef와 OR 결합 — 둘 다 같은 방향 신호 동등.
export type VirtualInputState = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

// 가상 컨트롤러 입력 — 모듈 스코프 단일 인스턴스 (keysRef와 같은 패턴).
// VirtualController가 setVirtualInput으로 갱신, applyChiPhysics가 매 프레임 읽음.
// solo.tsx 경유 없이 chi-input.ts가 직접 보유 → root 마운트된 컨트롤러도 동작.
const virtualInputRef = {
  current: {
    up: false,
    down: false,
    left: false,
    right: false,
  } as VirtualInputState,
}

export function setVirtualInput(state: VirtualInputState): void {
  virtualInputRef.current = state
}

// 가상 컨트롤러 방향(상/하/좌/우) 중 하나라도 눌렸는지 — read-only.
// wedding 자막을 가상패드로 진행(모바일)하기 위한 폴링용. virtualInputRef 자체는 비노출 유지.
export function isAnyVirtualDirDown(): boolean {
  const v = virtualInputRef.current
  return v.up || v.down || v.left || v.right
}

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
// (RAF 60fps 가정으로 위치 += vx 그대로 더한다). getLevel도 호환용 (옷 효과 사이클 W).
// 가상 컨트롤러 입력은 setVirtualInput으로 module-level virtualInputRef에 누적된 값을 매 프레임 OR로 읽음.
//
// getMode: 'pvp' 반환 시 화살표 키 무시 (reference 1602~1606). 미지정 시 'solo' 기본.
export function applyChiPhysics(
  refs: GameRefs,
  now: number,
  dt: number,
  getLevel: () => number,
  getMode?: () => 'solo' | 'pvp',
  chiSpeedMul = 1,
): void {
  void dt
  void getLevel
  const k = keysRef.current
  const v = virtualInputRef.current
  const chi = refs.chi
  const isPvp = getMode ? getMode() === 'pvp' : false

  // 솔로 = WASD + 방향키 + 가상 컨트롤러 OR. PvP에선 chi가 WASD 전용 (화살표는 cat 전담).
  let tvx = 0
  let tvy = 0
  if (k['a'] || (!isPvp && k['arrowleft']) || v.left) tvx -= 1
  if (k['d'] || (!isPvp && k['arrowright']) || v.right) tvx += 1
  if (k['w'] || (!isPvp && k['arrowup']) || v.up) tvy -= 1
  if (k['s'] || (!isPvp && k['arrowdown']) || v.down) tvy += 1

  // facing — 좌우 입력만 기준 (수직 입력은 방향 안 바꿈).
  if (tvx > FACING_DEADZONE) chi.facing = 'right'
  else if (tvx < -FACING_DEADZONE) chi.facing = 'left'

  // boost/mega는 effects에서 (chiBoost.until > now 시 1.55 또는 2.0).
  // 옷 효과 chiSpeedMul은 부스트/슬로우 배율과 곱연산 (덮어쓰기 아님).
  const speed = MAX_SPEED * getChiSpeedMul(refs, now) * chiSpeedMul

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

  // 위치 갱신 + 동적 clamp (reference 1633: slow=65, 평소=50).
  const isSlow = refs.effects.chiSlow.until > now
  const margin = isSlow ? CHI_MARGIN_SLOW : CHI_MARGIN_NORMAL
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
