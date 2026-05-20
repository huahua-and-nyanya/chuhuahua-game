import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'

// 쉴드 시각 효과는 ShieldBubble로 분리. Cat에서 shielded 분기 제외.
// 좌우 반전은 게임 루프(사이클 C)가 wrapper에서 scaleX(catFacing)로 처리.
interface CatProps {
  kissing?: boolean
  scared?: boolean
  angry?: boolean
  boosted?: boolean
  slowed?: boolean
  equippedSrc?: string
}

// 우선순위: kissing > slowed > angry > scared > equippedSrc > default
function pickSrc(props: CatProps): string {
  if (props.kissing) return CHARACTER_ASSETS.catKissing
  if (props.slowed) return CHARACTER_ASSETS.catSlow
  if (props.angry) return CHARACTER_ASSETS.catAngry
  if (props.scared) return CHARACTER_ASSETS.catScared
  if (props.equippedSrc) return props.equippedSrc
  return CHARACTER_ASSETS.cat
}

// 효과별 통일 비율: 약(kissing) ×1.05 / 강(slowed, angry) ×1.10
const SIZE_BASE = 80
const SIZE_SOFT = 84
const SIZE_STRONG = 88

function pickSize(props: CatProps): number {
  if (props.kissing) return SIZE_SOFT
  if (props.slowed || props.angry) return SIZE_STRONG
  return SIZE_BASE
}

function pickFilter(props: CatProps): string {
  if (props.kissing)
    return 'brightness(1.15) drop-shadow(0 0 8px rgba(255, 61, 127, 0.9))'
  if (props.slowed)
    return 'drop-shadow(0 0 8px rgba(160, 90, 58, 0.85)) drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
  if (props.boosted)
    return 'brightness(1.1) drop-shadow(0 0 10px rgba(255, 140, 0, 0.9))'
  if (props.angry)
    return 'brightness(1.05) drop-shadow(0 0 8px rgba(120, 200, 50, 0.85))'
  if (props.scared) return 'drop-shadow(0 0 6px rgba(255, 50, 50, 0.6))'
  return 'drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
}

export function Cat(props: CatProps): JSX.Element {
  const size = pickSize(props)
  return (
    <img
      src={pickSrc(props)}
      alt=""
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
        filter: pickFilter(props),
        transition: 'filter 0.2s ease, width 0.2s ease, height 0.2s ease',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
