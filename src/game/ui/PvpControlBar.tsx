import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { PixelButton } from '@/ui/PixelButton'

// /multi/local 라우트의 일시정지/그만두기 버튼 row.
// root layout이 PvP 한정으로 노출하는 #pvp-controls-slot에 portal로 마운트.
// 솔로 SoloControlBar 패턴 미러 — slot id만 PvP 전용(`pvp-controls-slot`)로 분리해
// 솔로 slot(`game-controls-slot`) 동작에 영향 0.
//
// state는 local.tsx가 source of truth, 본 컴포넌트는 props로 받아 표시만.

const SLOT_ID = 'pvp-controls-slot'

// arcade variant glow 색 — playing 시 노랑(주의), paused 시 초록(재개), quit 빨강(위험).
// 솔로와 동일 톤.
const COLOR_PAUSE = '#ffd83d'
const COLOR_RESUME = '#33ff66'
const COLOR_QUIT = '#ff3344'

export type PvpControlBarProps = {
  paused: boolean
  onTogglePause: () => void
  onQuit: () => void
}

export function PvpControlBar({
  paused,
  onTogglePause,
  onQuit,
}: PvpControlBarProps) {
  // portal target은 root layout이 commit한 후에야 DOM에 존재 → mount effect에서 resolve.
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
