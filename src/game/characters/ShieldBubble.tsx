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

// 2층 구조: wrapper가 중앙정렬(translate -50%,-50%) 담당,
// img가 펄스 애니메이션(scale + opacity) 담당.
// keyframes가 transform을 덮어쓰는 문제 회피.
export function ShieldBubble({ owner }: ShieldBubbleProps): JSX.Element {
  const size = owner === 'chi' ? BUBBLE_SIZE_CHI : BUBBLE_SIZE_CAT
  return (
    <div
      aria-label={`${owner} shield`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 4,
        pointerEvents: 'none',
        lineHeight: 0,
      }}
    >
      <img
        src={CHARACTER_ASSETS.catShield}
        alt=""
        draggable={false}
        style={{
          display: 'block',
          width: size,
          height: size,
          objectFit: 'contain',
          filter:
            'brightness(1.05) drop-shadow(0 0 8px rgba(93, 173, 226, 0.9))',
          animation: 'bubble-pulse 1.2s ease-in-out infinite',
          userSelect: 'none',
        }}
      />
    </div>
  )
}
