// reference 1880~ 패턴: 중앙 정렬 정적 글로우 + 텍스트.
// 1.8s 자동 사라짐은 expireTransients(C-5')가 levelUpEffect.active=false로 처리.
// 18개 금하트 파티클은 라우트(C-5')의 onLevelUp 콜백에서 floatTexts에 push.

export type LevelUpOverlayProps = {
  active: boolean
  level: number
}

export function LevelUpOverlay({ active, level }: LevelUpOverlayProps) {
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
      <span
        className="font-display text-4xl leading-none"
        style={{
          color: 'var(--color-game-accent-gold)',
          textShadow:
            '0 0 12px var(--color-game-accent-gold), 0 0 24px var(--color-game-accent-gold)',
        }}
      >
        LEVEL UP!
      </span>
      <span
        className="font-display text-6xl leading-none"
        style={{
          color: 'var(--color-text-on-pink)',
          textShadow: '0 0 8px var(--color-ink-base)',
        }}
      >
        LV {level}
      </span>
    </div>
  )
}
