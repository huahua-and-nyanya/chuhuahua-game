import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'

// 쉴드 활성 시: cat 이미지를 catShield 변신 일러스트로 교체 + 푸른 글로우.
// 추가로 ShieldBubble을 별도 오버레이로 띄움 (게임 루프 책임).
// 원본 패턴 — reference/ChihuahuaCatKissGame.txt:464-472.
// 좌우 반전은 게임 루프(사이클 C)가 wrapper에서 scaleX(catFacing)로 처리.
interface CatProps {
  kissing?: boolean
  shielded?: boolean
  scared?: boolean
  angry?: boolean
  boosted?: boolean
  slowed?: boolean
  equippedSrc?: string
}

// 우선순위: kissing > shielded > slowed > angry > scared > equippedSrc > default
function pickSrc(props: CatProps): string {
  if (props.kissing) return CHARACTER_ASSETS.catKissing
  if (props.shielded) return CHARACTER_ASSETS.catShield
  if (props.slowed) return CHARACTER_ASSETS.catSlow
  if (props.angry) return CHARACTER_ASSETS.catAngry
  if (props.scared) return CHARACTER_ASSETS.catScared
  if (props.equippedSrc) return props.equippedSrc
  return CHARACTER_ASSETS.cat
}

// 효과별 통일 비율: 약(kissing) ×1.05 / 강(shielded, slowed, angry) ×1.10
const SIZE_BASE = 120
const SIZE_SOFT = 126
const SIZE_STRONG = 132

function pickSize(props: CatProps): number {
  if (props.kissing) return SIZE_SOFT
  if (props.shielded || props.slowed || props.angry) return SIZE_STRONG
  return SIZE_BASE
}

function pickFilter(props: CatProps): string {
  if (props.kissing)
    return 'brightness(1.15) drop-shadow(0 0 8px rgba(255, 61, 127, 0.9))'
  if (props.shielded)
    return 'brightness(1.05) drop-shadow(0 0 8px rgba(93, 173, 226, 0.9))'
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
