import { PixelChip } from '@/ui/PixelChip'
import {
  BOOST_DURATION,
  SCORE_MULT_DURATION,
  SHIELD_DURATION,
} from '@/game/constants'
import type { EffectState } from '@/game/state'

// 좌상단: 점수 / 콤보 / 최대콤보
// 우상단: 레벨 + 효과 게이지 (chiBoost / catShield / scoreMult)
//   - 솔로엔 catSlow/catSpeedup 자체가 안 발동되므로 표시 X
// 게이지 너비 동적 인라인 (Tailwind 동적 클래스 불가), 색상은 토큰 변수 참조

export type HUDProps = {
  score: number
  combo: number
  maxCombo: number
  level: number
  effects: EffectState
  now: number
}

type GaugeDef = {
  label: string
  remaining: number
  duration: number
  color: string
}

export function HUD(props: HUDProps) {
  const { score, combo, maxCombo, level, effects, now } = props

  const gauges: GaugeDef[] = []
  const boostRemaining = effects.chiBoost.until - now
  if (boostRemaining > 0) {
    gauges.push({
      label: effects.chiBoost.mega ? 'MEGA' : 'BOOST',
      remaining: boostRemaining,
      duration: BOOST_DURATION,
      color: 'var(--color-game-warn)',
    })
  }
  const shieldRemaining = effects.catShield.until - now
  if (shieldRemaining > 0) {
    gauges.push({
      label: 'SHIELD',
      remaining: shieldRemaining,
      duration: SHIELD_DURATION,
      color: 'var(--color-game-shield-blue)',
    })
  }
  const multRemaining = effects.scoreMult.until - now
  if (multRemaining > 0) {
    gauges.push({
      label: `×${effects.scoreMult.value}`,
      remaining: multRemaining,
      duration: SCORE_MULT_DURATION,
      color: 'var(--color-game-accent-gold)',
    })
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
        <PixelChip>SCORE {score}</PixelChip>
        {combo > 1 && <PixelChip>COMBO ×{combo}</PixelChip>}
        {maxCombo > 0 && (
          <PixelChip variant="disabled">MAX {maxCombo}</PixelChip>
        )}
      </div>
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        <PixelChip>LV {level}</PixelChip>
        {gauges.map((g) => (
          <Gauge key={g.label} {...g} />
        ))}
      </div>
    </div>
  )
}

function Gauge({ label, remaining, duration, color }: GaugeDef) {
  const ratio = Math.max(0, Math.min(1, remaining / duration))
  return (
    <div className="flex w-24 flex-col items-end gap-0.5">
      <span className="font-display text-xs leading-none" style={{ color }}>
        {label}
      </span>
      <div className="rounded-pill h-1.5 w-full overflow-hidden bg-pink-100">
        <div
          className="h-full transition-[width] duration-100"
          style={{ width: `${ratio * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}
