import { createFileRoute } from '@tanstack/react-router'

import { MAIN_HERO } from '@/assets'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// 메인 카드 내부 슬롯(CoinChip/트로피/?/메뉴) + 모달은 모두 __root.tsx 라우트 분기 책임.
// 본 컴포넌트는 카드 배경 일러스트만 그린다 (포인터 통과).
function HomePage() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: `url(${MAIN_HERO}) center / cover no-repeat` }}
    />
  )
}
