import type { JSX } from 'react'
import { ITEM_ASSETS } from '@/assets'

export function WeddingRing(): JSX.Element {
  return (
    <img
      src={ITEM_ASSETS.weddingRing}
      alt=""
      draggable={false}
      style={{
        width: 75,
        height: 75,
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.2))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
