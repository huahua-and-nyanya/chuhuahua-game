import { useState } from 'react'
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { ICON_ASSETS, PAGE_BGS } from '@/assets'
import { ControllerCard } from '@/components/layout/ControllerCard'
import { GameFrameCard } from '@/components/layout/GameFrameCard'
import { useCoins } from '@/features/coins/useCoins'
import { GAME_WIDTH } from '@/game/constants'
import { useResponsiveScale } from '@/hooks/useResponsiveScale'
import { getCurrentSeason } from '@/lib/season'
import { CenterModal } from '@/ui/CenterModal'
import { CoinChip } from '@/ui/CoinChip'
import { IconNavButton } from '@/ui/IconNavButton'
import { NavButton } from '@/ui/NavButton'
import { PixelButton } from '@/ui/PixelButton'

import { MultiplayerSelectModal } from './-components/MultiplayerSelectModal'
import styles from './-styles/HomePage.module.css'

export const Route = createRootRoute({
  component: RootLayout,
})

// 모든 라우트가 공유하는 외곽 = 분홍/계절 배경 + DS 스타일 두 카드 묶음.
//   - GameFrameCard (상단 스크린): 좌표계 640×480 + scale inner wrapper. Outlet이 들어감.
//     메인 라우트 한정으로 카드 내부 슬롯(CoinChip/코너 액션/사이드 메뉴) 추가.
//   - ControllerCard (하단 조작부, 모바일 한정): WASD + D-pad 영구 표시. 메뉴 row는 라우트 분기.
//
// 데스크탑은 ControllerCard 없음 (키보드로 충분) — GameFrameCard만 사방 둥근 모서리 단독.
// 모바일에서는 두 카드가 위/아래 딱 붙고 경계선 1줄 (ControllerCard.border-top).
//
// 모달 state는 root가 관리 → 라우트 이동에도 안정 + 카드 내부/외부 슬롯에서 콜백 공유.
const TOP_LEFT_SLOT_CLASSES =
  'absolute top-frame-inner left-frame-inner flex flex-row gap-sm z-[2]'
const CORNER_ACTIONS_SLOT_CLASSES =
  'absolute top-frame-inner right-frame-inner flex flex-row gap-sm z-[2] max-md:hidden'
const SIDE_MENU_SLOT_CLASSES =
  'absolute right-frame-inner bottom-frame-inner flex flex-col gap-nav-button-gap z-[2] max-md:hidden'

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isMain = pathname === '/'
  const navigate = useNavigate()
  const { coins } = useCoins()
  const [multiOpen, setMultiOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [rankingOpen, setRankingOpen] = useState(false)
  const { scale, isMobile } = useResponsiveScale()
  const seasonBg = PAGE_BGS[getCurrentSeason()]
  const cardWidth = scale * GAME_WIDTH

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
        onClick={() => setRankingOpen(true)}
      />
      <IconNavButton
        icon={ICON_ASSETS.help}
        alt="게임 방법"
        onClick={() => setGuideOpen(true)}
      />
    </>
  )

  const sideMenu = (
    <>
      <NavButton label="혼자서" onClick={() => navigate({ to: '/solo' })} />
      <NavButton label="둘이서" onClick={() => setMultiOpen(true)} />
      <NavButton label="옷장" onClick={() => navigate({ to: '/wardrobe' })} />
    </>
  )

  // 모바일 ControllerCard의 메뉴 row — 메인 한정. /solo 등은 null (컨트롤러만 표시).
  const controllerMenuSlot =
    isMain && isMobile ? (
      <div className="gap-sm flex w-full flex-row justify-center">
        {sideMenu}
      </div>
    ) : null

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
            <GameFrameCard scale={scale} hasControllerBelow={isMobile}>
              <Outlet />

              {/* 메인 카드 내부 슬롯 — 메인 한정. /solo 등 다른 라우트는 자체 콘텐츠 */}
              {isMain && (
                <>
                  <div className={TOP_LEFT_SLOT_CLASSES}>
                    <CoinChip
                      amount={coins}
                      size="md"
                      className="max-md:hidden"
                    />
                    <CoinChip amount={coins} size="sm" className="md:hidden" />
                  </div>
                  <div className={CORNER_ACTIONS_SLOT_CLASSES}>
                    {cornerActions}
                  </div>
                  <div className={SIDE_MENU_SLOT_CLASSES}>{sideMenu}</div>
                </>
              )}
            </GameFrameCard>

            {/* DS 하단 조작부 (모바일 한정). 메뉴 row는 라우트별, 컨트롤러는 영구. */}
            {isMobile && (
              <ControllerCard width={cardWidth} menuSlot={controllerMenuSlot} />
            )}
          </div>
        </main>
      </div>

      <MultiplayerSelectModal
        open={multiOpen}
        onClose={() => setMultiOpen(false)}
      />
      <CenterModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="게임 방법"
      >
        준비 중
      </CenterModal>
      <CenterModal
        open={rankingOpen}
        onClose={() => setRankingOpen(false)}
        title="랭킹"
      >
        준비 중
      </CenterModal>

      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  )
}
