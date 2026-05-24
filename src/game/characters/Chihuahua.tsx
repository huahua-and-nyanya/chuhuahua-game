import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'

interface ChihuahuaProps {
  kissing?: boolean
  boosted?: boolean
  mega?: boolean
  slowed?: boolean
  sad?: boolean
  equippedSrc?: string
}

// 우선순위: kissing > sad > slowed > equippedSrc > default
function pickSrc(props: ChihuahuaProps): string {
  if (props.kissing) return CHARACTER_ASSETS.chihuahuaKissing
  if (props.sad) return CHARACTER_ASSETS.chihuahuaSad
  if (props.slowed) return CHARACTER_ASSETS.chihuahuaSlow
  if (props.equippedSrc) return props.equippedSrc
  return CHARACTER_ASSETS.chihuahua
}

// 효과별 통일 비율: 약(kissing, sad) ×1.05 / 강(slowed, mega) ×1.10
const SIZE_BASE = 96
const SIZE_SOFT = 101
const SIZE_STRONG = 105

function pickSize(props: ChihuahuaProps): number {
  if (props.kissing || props.sad) return SIZE_SOFT
  if (props.slowed || props.mega) return SIZE_STRONG
  return SIZE_BASE
}

function pickFilter(props: ChihuahuaProps): string {
  if (props.kissing)
    return 'brightness(1.15) drop-shadow(0 0 8px rgba(255, 61, 127, 0.9))'
  if (props.sad)
    return 'drop-shadow(0 0 6px rgba(93, 173, 226, 0.7)) drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
  if (props.mega)
    return 'brightness(1.2) drop-shadow(0 0 12px rgba(255, 215, 0, 1)) saturate(1.4)'
  if (props.boosted)
    return 'brightness(1.1) drop-shadow(0 0 10px rgba(255, 140, 0, 0.9))'
  if (props.slowed)
    return 'drop-shadow(0 0 8px rgba(160, 90, 58, 0.85)) drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
  return 'drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
}

export function Chihuahua(props: ChihuahuaProps): JSX.Element {
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
