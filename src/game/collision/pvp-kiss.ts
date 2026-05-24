import {
  KISS_DEBOUNCE,
  KISS_DIST,
  KISS_DURATION,
  MWAH_DURATION,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { addParticles } from '@/game/particles'
import type { ParticleRef } from '@/game/state'

// 솔로 kiss와 같은 하트 폭발 색상.
const KISS_COLORS = ['#ff3d7f', '#ff85a1', '#ffadc6', '#ff5577']

function spawnKissParticles(refs: GameRefs, now: number): void {
  const count = 4 + Math.floor(Math.random() * 3)
  const newOnes: ParticleRef[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
    const speed = 3 + Math.random() * 3
    newOnes.push({
      id: now + i + Math.random(),
      x: refs.chi.x,
      y: refs.chi.y - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      vr: (Math.random() - 0.5) * 14,
      rot: Math.random() * 360,
      size: 12 + Math.random() * 8,
      life: 24 + Math.random() * 10,
      color: KISS_COLORS[i % KISS_COLORS.length],
    })
  }
  addParticles(refs.particles, newOnes)
}

// reference 1773~1825 PvP 분기 이식.
// - 600ms 디바운스 (scoreMirror.lastKissAt 공용 사용)
// - KISS_DIST 내 진입 시:
//   • 고양이 쉴드 활성 → 쉴드 소진 + chiSad floatText (chiSad 상태 자체는 F-1에서 표시 X)
//   • 그 외 → pvpKissCount += 1 + kissing 플래그/mwah/하트 파티클 발동
//   콤보/점수/코인 시스템은 사용하지 않음.
//
// onChiSadKiss: 쉴드 막힘 시 호출 (F-2에서 토스트/스프라이트 sad 전환에 사용. F-1은 no-op도 가능).
// onKiss: 실제 뽀뽀 성공 시 호출 (F-1은 카운트 증가만, F-2에서 효과음 등 후속).
export type PvpKissDeps = {
  refs: GameRefs
  now: number
  onShieldBlock?: () => void
  onKiss?: () => void
}

const CHI_SAD_DURATION = 1500 // ms — reference CHI_SAD_DURATION 동일 (F-1: floatText까지만)
const FLOAT_LIFETIME = 800 // ms — FloatText 일치 (solo.tsx FLOAT_DURATION)

export function checkPvpKiss(deps: PvpKissDeps): void {
  const { refs, now, onShieldBlock, onKiss } = deps
  const chi = refs.chi
  const cat = refs.cat

  if (now - refs.scoreMirror.lastKissAt < KISS_DEBOUNCE) return

  const dxk = chi.x - cat.x
  const dyk = chi.y - cat.y
  const dk = Math.hypot(dxk, dyk)
  if (dk >= KISS_DIST) return

  // 디바운스용 타임스탬프는 양 분기 공통 갱신 (실드 막힘도 1회 처리로 카운트).
  refs.scoreMirror.lastKissAt = now

  // 고양이 쉴드 활성 시 — 쉴드 1회 소진. PvP에선 카운트 증가 X.
  if (refs.effects.catShield.until > now) {
    refs.effects.catShield = { until: 0 }
    // chi sad: F-1은 floatText만 (sprite sad 전환은 F-2에서 chiSadRef 도입 시).
    refs.floatTexts.push({
      id: now + Math.random(),
      text: '쉴드!',
      x: cat.x,
      y: cat.y - 20,
      color: 'var(--color-game-shield-blue)',
      until: now + FLOAT_LIFETIME,
    })
    // chiSad lifetime 자리만 표시. F-1은 시각 상태 토글 X — 참조 보존.
    void CHI_SAD_DURATION
    if (onShieldBlock) onShieldBlock()
    return
  }

  refs.kissing = { active: true, until: now + KISS_DURATION }
  const cx = (chi.x + cat.x) / 2
  const cy = (chi.y + cat.y) / 2 - 16
  refs.mwah = { active: true, until: now + MWAH_DURATION, x: cx, y: cy - 12 }

  spawnKissParticles(refs, now)

  // reference 1791~1794: 콤보/점수 시스템 우회, 카운트만 증가.
  refs.pvp.kissCount += 1

  if (onKiss) onKiss()
}
