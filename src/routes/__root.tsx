import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { motion } from 'framer-motion'

import { PAGE_BGS, TITLE_LOGO } from '@/assets'
import { getCurrentSeason } from '@/lib/season'
import { PixelButton } from '@/ui/PixelButton'

import styles from './-styles/HomePage.module.css'

export const Route = createRootRoute({
  component: RootLayout,
})

// 모든 라우트가 공유하는 외곽 = 분홍/계절 배경 + 카드 외부 헤더 + 카드 외곽 + Outlet.
// 카드 내부의 slot 시스템(CoinChip/트로피/?/메뉴/HUD 등)은 라우트가 100% 책임진다.
// root는 카드 외곽 div + Outlet만 책임.
//
// 카드 외부 헤더:
//   - 메인(/): motion title 로고 (카드 위 absolute 중앙)
//   - 그 외: "< 메인으로" 버튼 (카드 위 좌측, normal flow)
//
// CARD_OUTER_CLASSES는 기존 GameFrame.ROOT_CLASSES를 인라인한 것 — slot 컨테이너는 제외.
// 시각은 GameFrame과 동일(border/rounded/aspect/shadow/default 분홍 그라데이션).
const CARD_OUTER_CLASSES =
  'relative w-full mx-auto overflow-hidden ' +
  'max-w-frame max-md:max-w-[95vw] ' +
  'aspect-frame rounded-frame ' +
  'border-[length:var(--frame-border-width)] border-solid border-border-frame ' +
  '[background:var(--gradient-frame-bg)] ' +
  'shadow-[inset_0_0_0_var(--frame-inset-width)_var(--color-border-frame-inset)]'

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isMain = pathname === '/'
  const seasonBg = PAGE_BGS[getCurrentSeason()]

  return (
    <>
      {/* 메인 외 라우트: 페이지 좌상단 fixed — 카드/frameStack 레이아웃에 영향 0. */}
      {!isMain && (
        <Link to="/" className="top-lg left-lg fixed z-10">
          <PixelButton variant="ghost" size="sm">
            {'< 메인으로'}
          </PixelButton>
        </Link>
      )}

      <div className="page-bg" style={{ backgroundImage: `url(${seasonBg})` }}>
        <main className={styles.page}>
          <div className={styles.frameStack}>
            {isMain && (
              <motion.img
                src={TITLE_LOGO}
                alt="츄와와 뽀뽀 돌격"
                className={styles.title}
                style={{ x: '-50%' }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              />
            )}

            <div className={CARD_OUTER_CLASSES}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  )
}
