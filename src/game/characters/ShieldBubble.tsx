import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'
import type { PickerSide } from '../state'

// TODO(Cycle W): CSS 거품(radial-gradient + border + shield-pulse 0.8s)으로 재작성.
// 원본 chi shield 패턴 참조 — reference/ChihuahuaCatKissGame.txt:2597-2611.
// 현재 catShield PNG는 cat 변신 이미지(거품 아님)라 임시로 사용,
// 사이클 W에서 PNG 제거 + chi/cat owner별 색상/그라디언트 분기 결정.

// 거품 = 캐릭터 기본 사이즈 × 1.3 (여유있게 감싸는 비율)
const BUBBLE_SIZE_CHI = 84 // chi 기본 64 × 1.3
const BUBBLE_SIZE_CAT = 104 // cat 기본 80 × 1.3

interface ShieldBubbleProps {
  owner: PickerSide
}

export function ShieldBubble({ owner }: ShieldBubbleProps): JSX.Element {
  const size = owner === 'chi' ? BUBBLE_SIZE_CHI : BUBBLE_SIZE_CAT
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
        width: size,
        height: size,
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
