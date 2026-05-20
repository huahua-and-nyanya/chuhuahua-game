import type { JSX } from 'react'
import { ITEM_ASSETS } from '@/assets'

export function Kibble(): JSX.Element {
  return (
    <img
      src={ITEM_ASSETS.kibble}
      alt=""
      draggable={false}
      style={{
        width: 50,
        height: 24,
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.2))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
