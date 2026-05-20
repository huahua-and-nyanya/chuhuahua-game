import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'
import type { PickerSide } from '../state'

// TODO(Cycle W): owner='chi'일 때 별도 자산 또는 색상 분기 결정.
// TODO(Cycle B-5): bubble-pulse keyframe 적용.
interface ShieldBubbleProps {
  owner: PickerSide
}

export function ShieldBubble({ owner }: ShieldBubbleProps): JSX.Element {
  return (
    <img
      src={CHARACTER_ASSETS.catShield}
      alt=""
      aria-label={`${owner} shield`}
      draggable={false}
      style={{
        width: 130,
        height: 130,
        objectFit: 'contain',
        flexShrink: 0,
        filter: 'brightness(1.05) drop-shadow(0 0 8px rgba(93, 173, 226, 0.9))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
