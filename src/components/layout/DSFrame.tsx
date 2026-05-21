import type { ReactNode } from 'react'

// 모바일 전용 DS 스타일 통합 프레임.
// 진한 분홍(pink-500) 외곽 + 검정 ink border + 둥근 모서리.
// 자식: GameFrameCard(상단 화면) + [메뉴 row, 메인 한정] + VirtualController.
//
// width: viewport 100% (page padding 16 × 2 이미 main에서 빠짐). 한계치까지 가로 사용.
// max-w를 viewport 기반 calc로 명시 → 자식 박스가 부모를 살짝 넘는 회귀 방지.
// p-md(12px) 내부 padding. 자식 사이 gap-md(12px). column flex로 정렬.
const CLASSES =
  'mx-auto w-full max-w-[calc(100vw-2*var(--gap-lg))] ' +
  'bg-pink-500 ' +
  'border-2 border-ink-base ' +
  'rounded-3xl ' +
  'p-md ' +
  'shadow-card ' +
  'flex flex-col items-center gap-md ' +
  'select-none'

export function DSFrame({ children }: { children: ReactNode }) {
  return <div className={CLASSES}>{children}</div>
}
