import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'

interface PigeonProps {
  fleeing?: boolean
}

export function Pigeon({ fleeing }: PigeonProps): JSX.Element {
  return (
    <img
      src={CHARACTER_ASSETS.pigeon}
      alt=""
      draggable={false}
      style={{
        width: 70,
        height: 60,
        objectFit: 'contain',
        flexShrink: 0,
        filter: fleeing
          ? 'grayscale(0.5) opacity(0.8)'
          : 'drop-shadow(0 0 4px rgba(255, 50, 50, 0.4))',
        transition: 'filter 0.2s ease',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
