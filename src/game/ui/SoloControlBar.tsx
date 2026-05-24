import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { PixelButton } from '@/ui/PixelButton'

// /solo 라우트의 일시정지/그만두기 버튼 row.
// root layout이 제공하는 #game-controls-slot에 portal로 마운트.
//   - 모바일: DSFrame 안 메뉴 row 자리
//   - 데스크탑: GameFrameCard 아래
// 메인 라우트의 메뉴 row(sideMenu)와 같은 슬롯을 시점 분기로 점유 (메인 sideMenu vs solo controls).
//
// state는 solo.tsx가 source of truth, 본 컴포넌트는 props로 받아 표시만.

const SLOT_ID = 'game-controls-slot'

// arcade variant glow 색 — playing 시 노랑(주의), paused 시 초록(재개), quit 빨강(위험)
const COLOR_PAUSE = '#ffd83d'
const COLOR_RESUME = '#33ff66'
const COLOR_QUIT = '#ff3344'

export type SoloControlBarProps = {
  paused: boolean
  onTogglePause: () => void
  onQuit: () => void
}

export function SoloControlBar({
  paused,
  onTogglePause,
  onQuit,
}: SoloControlBarProps) {
  // portal target은 root layout이 commit한 후에야 DOM에 존재 → mount effect에서 resolve.
  // 외부 DOM 노드 resolve는 setState-in-effect rule의 정당한 사례 (외부 시스템에서 React로 동기).
  const [target, setTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(document.getElementById(SLOT_ID))
  }, [])

  if (target === null) return null

  return createPortal(
    <div className="gap-xl flex w-full justify-center">
      <PixelButton
        variant="arcade"
        size="sm"
        glowColor={paused ? COLOR_RESUME : COLOR_PAUSE}
        onClick={onTogglePause}
        className="max-w-40 flex-1"
      >
        {paused ? '▶ 다시 놀기' : '⏸ 잠깐 멈춤'}
      </PixelButton>
      <PixelButton
        variant="arcade"
        size="sm"
        glowColor={COLOR_QUIT}
        onClick={onQuit}
        className="max-w-40 flex-1"
      >
        ✕ 그만두기
      </PixelButton>
    </div>,
    target,
  )
}
