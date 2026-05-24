import type { JSX } from 'react'
import { ITEM_ASSETS } from '@/assets'

export function SweetPotato(): JSX.Element {
  return (
    <img
      src={ITEM_ASSETS.sweetPotato}
      alt=""
      draggable={false}
      style={{
        width: 75,
        height: 51,
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.25))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
