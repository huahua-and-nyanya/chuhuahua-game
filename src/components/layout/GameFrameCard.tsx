import type { ReactNode } from 'react'

import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'

// 게임 화면 카드 (DS 상단 스크린).
// 카드 자체에 inline width/height(scale 적용) + transform: scale inner wrapper로
// 좌표계 640×480을 카드 외곽에 정확히 매핑. 기존 root layout의 카드 외곽 패턴 그대로.
//
// hasControllerBelow=true → 하단 카드(ControllerCard)와 딱 붙음.
//   - 하단 모서리 직각 (rounded-b-none)
//   - 하단 border 제거 (border-b-0) → 두 카드 사이 경계선 1줄만 (ControllerCard.border-top)
// hasControllerBelow=false → 단독 카드. 사방 둥근 모서리 + 사방 border (rounded-frame).
const BASE_CLASSES =
  'relative mx-auto overflow-hidden ' +
  'border-[length:var(--frame-border-width)] border-solid border-border-frame ' +
  '[background:var(--gradient-frame-bg)] ' +
  'shadow-[inset_0_0_0_var(--frame-inset-width)_var(--color-border-frame-inset)]'

const FULL_RADIUS_CLASSES = 'rounded-frame'
const TOP_RADIUS_CLASSES = 'rounded-t-frame rounded-b-none border-b-0'

export type GameFrameCardProps = {
  scale: number
  hasControllerBelow: boolean
  children: ReactNode
}

export function GameFrameCard({
  scale,
  hasControllerBelow,
  children,
}: GameFrameCardProps) {
  const cardWidth = scale * GAME_WIDTH
  const cardHeight = scale * GAME_HEIGHT
  return (
    <div
      className={`${BASE_CLASSES} ${
        hasControllerBelow ? TOP_RADIUS_CLASSES : FULL_RADIUS_CLASSES
      }`}
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
