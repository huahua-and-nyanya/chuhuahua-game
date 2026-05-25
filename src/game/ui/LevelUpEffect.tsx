import type { LevelUpEffect as LevelUpEffectState } from '@/game/loop/state'

// 레벨업 효과 — 중앙에 "LEVEL X" 라벨 + conic-gradient radial rays.
// 1.8초 후 expireTransients가 active=false 토글 → null 반환으로 unmount.
// key={state.until} → 매 레벨업마다 재마운트로 애니메이션 재시작.
// conic-gradient의 rgba(...)는 alpha 조정 필요로 토큰 매핑 어려움 → 본 컴포넌트는 인라인 hex/rgba 허용.

export type LevelUpEffectProps = {
  state: LevelUpEffectState
  now: number
}

export function LevelUpEffect({ state, now }: LevelUpEffectProps) {
  if (!state.active || state.until <= now) return null
  // rays와 텍스트 모두 absolute + left/top 50% 패턴. keyframe의 translate(-50%, -50%)이
  // 본인 크기의 절반만큼 보정해 정확히 중앙. 부모에 flex 배치 X (이중 보정 방지).
  return (
    <div
      key={state.until}
      className="pointer-events-none absolute inset-0 z-18"
    >
      <div
        className="animate-level-up-rays absolute top-1/2 left-1/2"
        style={{
          width: 600,
          height: 600,
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.4) 30deg, transparent 60deg, rgba(255, 61, 127, 0.3) 90deg, transparent 120deg, rgba(251, 191, 36, 0.4) 150deg, transparent 180deg, rgba(255, 61, 127, 0.3) 210deg, transparent 240deg, rgba(251, 191, 36, 0.4) 270deg, transparent 300deg, rgba(255, 61, 127, 0.3) 330deg, transparent 360deg)',
        }}
      />
      <div
        className="font-display animate-level-up-burst absolute top-1/2 left-1/2 font-bold whitespace-nowrap"
        style={{
          fontSize: 64,
          color: 'var(--color-game-accent-gold)',
          textShadow:
            '5px 5px 0 var(--color-ink-base), -2px -2px 0 var(--color-ink-base), 2px -2px 0 var(--color-ink-base), -2px 2px 0 var(--color-ink-base), 2px 2px 0 var(--color-ink-base)',
        }}
      >
        LEVEL {state.level}
      </div>
    </div>
  )
}
