import {
  IconBone,
  IconHeartFilled,
  IconShield,
  IconStar,
} from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'

import {
  BOOST_DURATION,
  SCORE_MULT_DURATION,
  SHIELD_DURATION,
  SWEETPOTATO_DURATION,
} from '@/game/constants'
import type { EffectState, ToastRef } from '@/game/state'

import { Toasts } from './Toast'

// 좌상단: 흰 칩 + 채워진 하트 + 점수 숫자만 (SCORE 텍스트 X — 아이콘이 의미 전달)
// 우상단 stack (위→아래): LV 흰 칩 → 활성 효과 게이지 → 토스트
//   - LV 칩과 점수 칩 동일 스타일 (흰 fill + ink 텍스트 + ink 보더)
//   - 효과 게이지: 흰 칩 + Tabler 아이콘 + 작은 진행 바
//   - 토스트: 검정 배경 + 흰 글씨 (영구 vs 임시 시각 위계 구분)
//   - catSlow는 weddingBouquet(W1.1)로 솔로 발동되므로 하트 게이지로 표시. catSpeedup은 솔로 미발동이라 표시 X
// 카드 경계 마진 = top/left/right-md(12px) — 모바일 scale 시 카드 border와 안 겹침

export type HUDProps = {
  score: number
  level: number
  effects: EffectState
  now: number
  toasts: ToastRef[]
}

type GaugeDef = {
  key: string
  Icon: Icon
  colorVar: string
  remaining: number
  duration: number
}

const CHIP_CLASSES =
  'bg-bg-card border-ink-base text-text-primary gap-xs rounded-pill px-md py-xs flex items-center border-2 text-sm font-medium'

export function HUD(props: HUDProps) {
  const { score, level, effects, now, toasts } = props

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
  // catSlow — weddingBouquet 픽업 시 냐 감속(솔로 전용 발동). 하트 게이지로 표시.
  const catSlowRemaining = effects.catSlow.until - now
  if (catSlowRemaining > 0) {
    gauges.push({
      key: 'catSlow',
      Icon: IconHeartFilled,
      colorVar: '--color-pink-700',
      remaining: catSlowRemaining,
      duration: SWEETPOTATO_DURATION,
    })
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="top-md left-md absolute">
        <div className={CHIP_CLASSES}>
          <IconHeartFilled size={16} className="text-pink-700" />
          <span>{score}</span>
        </div>
      </div>
      <div className="top-md right-md gap-xs absolute flex flex-col items-end">
        <div className={CHIP_CLASSES}>LV {level}</div>
        {gauges.map(({ key, ...rest }) => (
          <EffectGauge key={key} {...rest} />
        ))}
        <Toasts toasts={toasts} />
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
