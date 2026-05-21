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
import { useCoins } from '@/features/coins/useCoins'
import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'
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

// 모든 라우트가 공유하는 외곽 = 분홍/계절 배경 + 카드 외곽 + Outlet.
// 메인 카드 내부 슬롯(CoinChip/트로피/?/메뉴) + 카드 외부 모바일 슬롯
// (mobileNav/mobileCornerActions) + 모달들은 모두 root가 라우트 분기로 그린다.
// (메인 외 라우트에서는 카드 내부 슬롯 X — 라우트별 자유 보장)
//
// 모달 state도 root가 관리해 라우트 이동에도 안정 + 메뉴 클릭 콜백을 카드 내부/외부 슬롯에서 공유.
//
// 카드 width/height는 useResponsiveScale가 계산 — viewport 가용 영역 안에서 max(좌표계 × 1.5).
// 카드 자체에 inline width/height + mx-auto로 가로 중앙, page flex centering로 세로 중앙.
// 카드 내부 inner wrapper = 좌표계(640×480) 고정 + transform scale로 카드 외곽에 정확 일치.
// → 캐릭터/HUD/좌표 사용처가 640×480 안에 그려지고 viewport 어디서든 카드 안에 머무름.
const CARD_OUTER_CLASSES =
  'relative mx-auto overflow-hidden ' +
  'rounded-frame ' +
  'border-[length:var(--frame-border-width)] border-solid border-border-frame ' +
  '[background:var(--gradient-frame-bg)] ' +
  'shadow-[inset_0_0_0_var(--frame-inset-width)_var(--color-border-frame-inset)]'

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
  const scale = useResponsiveScale()
  const seasonBg = PAGE_BGS[getCurrentSeason()]

  // /dev/* 는 개발자 라우트 — AppFrame(분홍 배경/카드/슬롯) 안 입히고 Outlet만 그림.
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
            {/* 모바일 카드 외부 코너 액션 (메인 한정, max-md만 표시) */}
            {isMain && (
              <div className={styles.mobileCornerActions}>{cornerActions}</div>
            )}

            <div
              className={CARD_OUTER_CLASSES}
              style={{
                width: scale * GAME_WIDTH,
                height: scale * GAME_HEIGHT,
              }}
            >
              {/* inner wrapper: 좌표계 640×480 고정 + transform scale로 카드 외곽에 정확 일치 */}
              <div
                className="absolute top-0 left-0"
                style={{
                  width: GAME_WIDTH,
                  height: GAME_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
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
                      <CoinChip
                        amount={coins}
                        size="sm"
                        className="md:hidden"
                      />
                    </div>
                    <div className={CORNER_ACTIONS_SLOT_CLASSES}>
                      {cornerActions}
                    </div>
                    <div className={SIDE_MENU_SLOT_CLASSES}>{sideMenu}</div>
                  </>
                )}
              </div>
            </div>

            {/* 모바일 카드 외부 메뉴 (메인 한정, max-md만 표시) */}
            {isMain && <div className={styles.mobileNav}>{sideMenu}</div>}
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
