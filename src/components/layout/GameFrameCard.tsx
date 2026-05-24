import type { ReactNode } from 'react'

import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'

// 게임 화면 카드.
// 데스크탑: 단독 카드 (사방 둥근 모서리).
// 모바일: DSFrame 안의 inner card (사방 둥근 모서리 동일, DS 프레임 핑크에 시각 분리).
//
// 카드 자체에 inline width/height(scale 적용) + transform: scale inner wrapper로
// 좌표계 640×480을 카드 외곽에 정확히 매핑. 게임 로직/충돌은 0% 영향.
const BASE_CLASSES =
  'relative mx-auto overflow-hidden rounded-frame ' +
  'border-[length:var(--frame-border-width)] border-solid border-border-frame ' +
  'bg-bg-card ' +
  'shadow-[inset_0_0_0_var(--frame-inset-width)_var(--color-border-frame-inset)]'

export type GameFrameCardProps = {
  scale: number
  children: ReactNode
}

export function GameFrameCard({ scale, children }: GameFrameCardProps) {
  const cardWidth = scale * GAME_WIDTH
  const cardHeight = scale * GAME_HEIGHT
  return (
    <div
      className={BASE_CLASSES}
      style={{ width: cardWidth, height: cardHeight }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}
