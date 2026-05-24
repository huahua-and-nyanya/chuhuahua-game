import type { ReactNode } from 'react'

import { dsFrameBg } from '@/assets'

// 모바일 전용 DS 스타일 통합 프레임.
// 외곽(분홍 배경 + ink border + 코너 디테일)은 ds-frame-bg.png 1장이 담당.
// 자식: GameFrameCard(상단 화면) + [메뉴 row, 메인 한정] + VirtualController.
//
// width: viewport 100% (page padding 16 × 2 이미 main에서 빠짐). 한계치까지 가로 사용.
// max-w를 viewport 기반 calc로 명시 → 자식 박스가 부모를 살짝 넘는 회귀 방지.
// 좌우/위 p-md(12px). 하단 pb-2xl(32px) — 가상패드 아래 시각적 여유.
// 자식 사이 gap-2xl(32px) — 시스템 메뉴(혼자서/둘이서/옷장) ↔ 가상패드 간 시각 분리.
const CLASSES =
  'relative mx-auto w-full max-w-[calc(100vw-2*var(--gap-lg))] ' +
  'p-md pb-2xl ' +
  'select-none'

const INNER_CLASSES = 'relative flex w-full flex-col items-center gap-2xl'

export function DSFrame({ children }: { children: ReactNode }) {
  return (
    <div className={CLASSES}>
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
