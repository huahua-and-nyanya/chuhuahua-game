import type { JSX } from 'react'
import type { PickerSide } from '../state'

// 원본 chi shield 거품 패턴 그대로 — reference/ChihuahuaCatKissGame.txt:2597-2611.
// radial-gradient + border + inset boxShadow + shield-pulse 0.8s.
// catShield PNG는 cat 변신용으로 Cat 컴포넌트가 직접 사용 (이 컴포넌트는 PNG 의존 없음).

// 거품 = 캐릭터 기본 사이즈 × 1.3 (여유있게 감싸는 비율)
const BUBBLE_SIZE_CHI = 84 // chi 기본 64 × 1.3
const BUBBLE_SIZE_CAT = 104 // cat 기본 80 × 1.3

interface ShieldBubbleProps {
  owner: PickerSide
}

// 2층 구조: wrapper가 중앙정렬(translate -50%,-50%) 담당,
// 내부 div가 펄스 애니메이션(scale + opacity)과 거품 시각 담당.
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
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(93, 173, 226, 0.15) 0%, rgba(93, 173, 226, 0.4) 70%, rgba(93, 173, 226, 0.15) 100%)',
          border: '3px solid rgba(93, 173, 226, 0.85)',
          boxShadow:
            '0 0 25px rgba(93, 173, 226, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.4)',
          animation: 'shield-pulse 0.8s ease-in-out infinite',
        }}
      />
    </div>
  )
}
