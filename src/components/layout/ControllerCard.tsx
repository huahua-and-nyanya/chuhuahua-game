import type { ReactNode } from 'react'

import { VirtualController } from '@/game/ui/VirtualController'

// DS 스타일 하단 조작부 (모바일 한정).
// 상단 모서리 직각 (위 카드와 붙는 면), 하단만 둥글게.
// border-top은 가지고 GameFrameCard.border-bottom은 제거 → 경계선 1줄.
// VirtualController(WASD + D-pad)는 항상 표시. menuSlot(라우트별 메뉴)은 위에 옵션 row.
const BASE_CLASSES =
  'relative mx-auto select-none ' +
  'rounded-b-frame ' +
  'border-[length:var(--frame-border-width)] border-solid border-border-frame ' +
  '[background:var(--gradient-frame-bg)] ' +
  'px-md py-md ' +
  'flex flex-col gap-md'

export type ControllerCardProps = {
  width: number
  // 메뉴 row (라우트별 분기) — 메인이면 NavButton row, 그 외엔 null.
  menuSlot?: ReactNode
}

export function ControllerCard({ width, menuSlot }: ControllerCardProps) {
  return (
    <div className={BASE_CLASSES} style={{ width }}>
      {menuSlot}
      <VirtualController />
    </div>
  )
}
