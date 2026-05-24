import type { ReactNode } from 'react'

import { dsFrameBg } from '@/assets'

// 모바일 전용 DS 스타일 통합 프레임.
// 외곽(분홍 배경 + ink border + 코너 디테일)은 ds-frame-bg.png 1장이 담당.
// 자식: GameFrameCard(상단 화면) + [메뉴 row, 메인 한정] + VirtualController.
//
// width: max-width는 외부(useResponsiveScale.dsFrameMaxWidth)에서 주입 — 카드 폭에 맞춰
//        DSFrame이 카드를 살짝 감싸는 비율 유지. mx-auto로 viewport 가운데 정렬.
// 좌우/위 p-md(12px). 하단 pb-2xl(32px) — 가상패드 아래 시각적 여유.
// 자식 사이 gap-2xl(32px) — 시스템 메뉴(혼자서/둘이서/옷장) ↔ 가상패드 간 시각 분리.
const CLASSES = 'relative mx-auto w-full p-md pb-2xl select-none'

const INNER_CLASSES = 'relative flex w-full flex-col items-center gap-2xl'

export function DSFrame({
  children,
  maxWidth,
}: {
  children: ReactNode
  maxWidth: number
}) {
  return (
    <div className={CLASSES} style={{ maxWidth }}>
      <img
        src={dsFrameBg}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
      <div className={INNER_CLASSES} style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
