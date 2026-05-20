import type { JSX } from 'react'
import { ITEM_ASSETS } from '@/assets'

export function Fish(): JSX.Element {
  return (
    <img
      src={ITEM_ASSETS.fish}
      alt=""
      draggable={false}
      style={{
        width: 50,
        height: 33,
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.2))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
