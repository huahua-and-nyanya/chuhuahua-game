import type { JSX } from 'react'
import { ITEM_ASSETS } from '@/assets'

export function Cucumber(): JSX.Element {
  return (
    <img
      src={ITEM_ASSETS.cucumber}
      alt=""
      draggable={false}
      style={{
        width: 56,
        height: 18,
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.25))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
