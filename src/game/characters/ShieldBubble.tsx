import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'
import type { PickerSide } from '../state'

// TODO(Cycle W): owner='chi'일 때 별도 자산 또는 색상 분기 결정.
// 현재는 owner 무관하게 catShield PNG + bubble-pulse 단일 패턴 사용.
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
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 130,
        height: 130,
        objectFit: 'contain',
        filter: 'brightness(1.05) drop-shadow(0 0 8px rgba(93, 173, 226, 0.9))',
        animation: 'bubble-pulse 1.2s ease-in-out infinite',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 4,
      }}
    />
  )
}
