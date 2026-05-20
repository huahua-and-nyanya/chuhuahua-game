import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'
import type { PickerSide } from '../state'

// TODO(Cycle W): CSS 거품(radial-gradient + border + shield-pulse 0.8s)으로 재작성.
// 원본 chi shield 패턴 참조 — reference/ChihuahuaCatKissGame.txt:2597-2611.
// 현재 catShield PNG는 cat 변신 이미지(거품 아님)라 임시로 100x100 + bubble-pulse 적용,
// 사이클 W에서 PNG 제거 + chi/cat owner별 분기 결정.
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
        width: 100,
        height: 100,
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
