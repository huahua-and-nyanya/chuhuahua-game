import { useEffect, type ReactNode } from 'react'
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { ICON_ASSETS, PAGE_BGS } from '@/assets'
import { DSFrame } from '@/components/layout/DSFrame'
import { GameFrameCard } from '@/components/layout/GameFrameCard'
import { useCoins } from '@/features/coins/useCoins'
import { VirtualController } from '@/game/ui/VirtualController'
import { useResponsiveScale } from '@/hooks/useResponsiveScale'
import { getCurrentSeason } from '@/lib/season'
import { CoinChip } from '@/ui/CoinChip'
import { IconNavButton } from '@/ui/IconNavButton'
import { NavButton } from '@/ui/NavButton'
import { PixelButton } from '@/ui/PixelButton'

import styles from './-styles/HomePage.module.css'

export const Route = createRootRoute({
  component: RootLayout,
})

// 모든 라우트가 공유하는 외곽.
// 모바일: 큰 분홍 DSFrame이 GameFrameCard + (메인 메뉴 row) + VirtualController를 감쌈.
//         메뉴 row는 메인 한정 (기존 NavButton 그대로, 위치만 DSFrame 안으로 이동).
//         WASD/D-pad는 항상 표시.
// 데스크탑: DSFrame 없음, GameFrameCard 단독 (이전 동작 그대로).
//
// 모달 state는 root가 관리 → 라우트 이동에도 안정 + 카드 내부/외부 슬롯에서 콜백 공유.
const TOP_LEFT_SLOT_CLASSES =
  'absolute top-frame-inner left-frame-inner flex flex-row gap-sm z-[2]'
const CORNER_ACTIONS_SLOT_CLASSES =
  'absolute top-frame-inner right-frame-inner flex flex-row gap-sm z-[2]'
const SIDE_MENU_SLOT_CLASSES =
  'absolute right-frame-inner bottom-frame-inner flex flex-col gap-nav-button-gap z-[2] max-md:hidden'

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isMain = pathname === '/'
  const isSolo = pathname === '/solo'
  const isPvpLocal = pathname === '/multi/local'
  const isContentRoute = ['/ranking', '/leaderboard', '/howto'].includes(
    pathname,
  )
  const navigate = useNavigate()
  const { coins, refresh: refreshCoins } = useCoins()
  // 라우트 변경 시 코인 재읽기 — solo의 earnCoins(다른 useWardrobe 인스턴스)가 갱신한
  // localStorage 값을 메인 복귀 시 반영 (root는 안 unmount → state가 stale로 남는 문제).
  useEffect(() => {
    refreshCoins()
  }, [pathname, refreshCoins])
  const { scale, isMobile, dsFrameMaxWidth } = useResponsiveScale()
  const seasonBg = PAGE_BGS[getCurrentSeason()]

  // /dev/* 는 개발자 라우트 — DS layout 안 입히고 Outlet만 그림.
  if (pathname.startsWith('/dev')) {
    return (
      <>
        <Outlet />
        {import.meta.env.DEV && (
          <TanStackRouterDevtools position="bottom-right" />
        )}
      </>
    )
  }

  const cornerActions = (
    <>
      <IconNavButton
        icon={ICON_ASSETS.ranking}
        alt="랭킹"
        onClick={() => navigate({ to: '/ranking' })}
      />
      <IconNavButton
        icon={ICON_ASSETS.help}
        alt="게임 방법"
        onClick={() => navigate({ to: '/howto' })}
      />
    </>
  )

  const sideMenu = (
    <>
      <NavButton label="혼자서" onClick={() => navigate({ to: '/solo' })} />
      <NavButton label="둘이서" onClick={() => navigate({ to: '/multi/local' })} />
      <NavButton label="옷장" onClick={() => navigate({ to: '/wardrobe' })} />
    </>
  )

  const gameCardChildren = (
    <>
      <Outlet />
      {/* 메인 카드 내부 슬롯 — 메인 한정. /solo 등 다른 라우트는 자체 콘텐츠 */}
      {isMain && (
        <>
          <div className={TOP_LEFT_SLOT_CLASSES}>
            <CoinChip amount={coins} size="md" className="max-md:hidden" />
            <CoinChip amount={coins} size="sm" className="md:hidden" />
          </div>
          <div className={CORNER_ACTIONS_SLOT_CLASSES}>{cornerActions}</div>
          <div className={SIDE_MENU_SLOT_CLASSES}>{sideMenu}</div>
        </>
      )}
    </>
  )

  // DSFrame 안 메뉴 row 자리 — 모바일 한정.
  //   - 메인: 기존 NavButton sideMenu
  //   - /solo: 빈 slot div(#game-controls-slot) — solo.tsx의 SoloControlBar가 portal로 들어옴
  //   - 그 외: null
  // 데스크탑은 frameStack 안 GameFrameCard 다음에 동일 id의 slot 별도 mount.
  let dsMenuRow: ReactNode = null
  if (isMobile) {
    if (isMain) {
      dsMenuRow = (
        <div className="gap-sm flex w-full flex-row justify-center">
          {sideMenu}
        </div>
      )
    } else if (isSolo) {
      dsMenuRow = <div id="game-controls-slot" className="w-full" />
    } else if (isPvpLocal) {
      dsMenuRow = <div id="pvp-controls-slot" className="w-full" />
    }
  }

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
            {isContentRoute ? (
              <Outlet />
            ) : isMobile ? (
              <DSFrame maxWidth={dsFrameMaxWidth}>
                <GameFrameCard scale={scale}>{gameCardChildren}</GameFrameCard>
                {dsMenuRow}
                <VirtualController />
              </DSFrame>
            ) : (
              <>
                <GameFrameCard scale={scale}>{gameCardChildren}</GameFrameCard>
                {/* 컨트롤 slot은 absolute로 normal flow에서 빼서 frameStack 높이에 영향 0.
                    → 카드 위치가 메인/솔로/PvP 모두 viewport 정중앙에 고정 (위로 밀리지 않음). */}
                {isSolo && (
                  <div
                    id="game-controls-slot"
                    className="mt-md absolute top-full right-0 left-0 flex justify-center"
                  />
                )}
                {isPvpLocal && (
                  <div
                    id="pvp-controls-slot"
                    className="mt-md absolute top-full right-0 left-0 flex justify-center"
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  )
}
