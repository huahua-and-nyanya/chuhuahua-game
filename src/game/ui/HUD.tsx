import type { Icon } from '@tabler/icons-react'
import { IconBone, IconShield, IconStar } from '@tabler/icons-react'

import {
  BOOST_DURATION,
  SCORE_MULT_DURATION,
  SHIELD_DURATION,
} from '@/game/constants'
import type { EffectState } from '@/game/state'
import { PixelChip } from '@/ui/PixelChip'

// 좌상단: SCORE 칩 (단일)
// 우상단: LV 칩 + 활성 효과 게이지(Bone/Shield/Star) — 위에서 아래 stack
//   - 게이지: 흰 칩 (아이콘 + 작은 진행 바). 활성 효과만 나타나고 만료 시 사라짐
//   - 솔로엔 catSlow/catSpeedup 자체가 안 발동되므로 표시 X
// 카드 경계 마진 = top/left/right-md(12px) — 모바일 scale 시 카드 border와 안 겹침

export type HUDProps = {
  score: number
  level: number
  effects: EffectState
  now: number
}

type GaugeDef = {
  key: string
  Icon: Icon
  colorVar: string
  remaining: number
  duration: number
}

export function HUD(props: HUDProps) {
  const { score, level, effects, now } = props

  const gauges: GaugeDef[] = []
  const boostRemaining = effects.chiBoost.until - now
  if (boostRemaining > 0) {
    gauges.push({
      key: 'boost',
      Icon: IconBone,
      colorVar: '--color-game-warn',
      remaining: boostRemaining,
      duration: BOOST_DURATION,
    })
  }
  const shieldRemaining = effects.catShield.until - now
  if (shieldRemaining > 0) {
    gauges.push({
      key: 'shield',
      Icon: IconShield,
      colorVar: '--color-game-shield-blue',
      remaining: shieldRemaining,
      duration: SHIELD_DURATION,
    })
  }
  const multRemaining = effects.scoreMult.until - now
  if (multRemaining > 0) {
    gauges.push({
      key: 'mult',
      Icon: IconStar,
      colorVar: '--color-game-accent-gold',
      remaining: multRemaining,
      duration: SCORE_MULT_DURATION,
    })
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="top-md left-md absolute">
        <PixelChip>SCORE {score}</PixelChip>
      </div>
      <div className="top-md right-md gap-xs absolute flex flex-col items-end">
        <PixelChip>LV {level}</PixelChip>
        {gauges.map(({ key, ...rest }) => (
          <EffectGauge key={key} {...rest} />
        ))}
      </div>
    </div>
  )
}

type EffectGaugeProps = Omit<GaugeDef, 'key'>

function EffectGauge({
  Icon,
  colorVar,
  remaining,
  duration,
}: EffectGaugeProps) {
  const ratio = Math.max(0, Math.min(1, remaining / duration))
  return (
    <div className="bg-bg-card border-ink-base gap-xs rounded-pill px-sm py-xs flex items-center border-2">
      <Icon size={16} stroke={2.5} style={{ color: `var(${colorVar})` }} />
      <div className="rounded-pill h-1 w-9 overflow-hidden bg-pink-50">
        <div
          className="rounded-pill h-full transition-[width] duration-150 ease-linear"
          style={{ width: `${ratio * 100}%`, background: `var(${colorVar})` }}
        />
      </div>
    </div>
  )
}
