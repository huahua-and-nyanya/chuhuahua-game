import { useEffect, type ReactNode } from 'react'
import { IconVolume, IconVolumeOff } from '@tabler/icons-react'
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
import { audioManager } from '@/features/audio/audioManager'
import { useAudio } from '@/features/audio/useAudio'
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
// 음소거 토글 — `< 메인으로`(PixelButton ghost)와 동일 동작: 평소 투명, hover/active 시에만
// 연핑크 배경. 단 아이콘 버튼이라 hover 배경이 원형(rounded-full). hover 색은 ghost 토큰 재사용.
const MUTE_BUTTON_CLASSES =
  'inline-flex items-center justify-center cursor-pointer rounded-full p-2 ' +
  'bg-transparent text-button-ghost-text ' +
  'hover:bg-button-ghost-bg-hover active:bg-button-ghost-bg-hover ' +
  'transition-colors duration-[var(--transition-fast)]'

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isMain = pathname === '/'
  const isSolo = pathname === '/solo'
  const isPvpLocal = pathname === '/multi/local'
  const isContentRoute = ['/ranking', '/howto'].includes(pathname)
  const navigate = useNavigate()
  const { coins, refresh: refreshCoins } = useCoins()
  const { muted, toggleMuted } = useAudio()
  // 라우트 변경 시 코인 재읽기 — solo의 earnCoins(다른 useWardrobe 인스턴스)가 갱신한
  // localStorage 값을 메인 복귀 시 반영 (root는 안 unmount → state가 stale로 남는 문제).
  useEffect(() => {
    refreshCoins()
  }, [pathname, refreshCoins])
  // 라우트별 BGM 매핑 (pathname 기반만). 같은 트랙 playBgm은 B1에서 no-op이라
  // {/, /ranking, /howto} 그룹은 bgmTitle을 공유하며 이동해도 안 끊김.
  // /solo·/multi/local은 여기서 호출 안 함 — 내부 상태별 곡을 각 라우트가 전담(B3a/B3b).
  //   solo: 웨딩(title)/일반(main) 분기, pvp: setup 무음 + playing pvp곡 등.
  //   (B2가 깔면 effect 순서상 부모가 자식 뒤에 실행돼 setup 무음/웨딩 분기를 덮음.)
  //   /solo·/multi/local·/dev/*는 어느 분기에도 안 걸려 미호출.
  // armAudio 정합: 첫 진입 시 arm 전이면 currentBgmTrack에 보관됐다 첫 상호작용에 재생(B1).
  useEffect(() => {
    if (pathname === '/' || pathname === '/ranking' || pathname === '/howto') {
      audioManager.playBgm('bgmTitle')
    } else if (pathname === '/wardrobe') {
      audioManager.playBgm('bgmCalm')
    }
  }, [pathname])
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
      <NavButton
        label="둘이서"
        onClick={() => navigate({ to: '/multi/local' })}
      />
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
      {/* 상단 고정 헤더 행 — 좌(메인으로)·우(음소거)를 한 행에 묶어 같은 높이선 정렬(items-center).
          카드/frameStack 레이아웃엔 영향 0(fixed). /dev는 위에서 early-return이라 미적용.
          좌측 `< 메인으로`는 !isMain 한정 → 메인에선 빈 spacer로 두고 음소거만 우측 유지. */}
      <div className="top-md right-md left-md fixed z-10 flex items-center justify-between">
        {!isMain ? (
          <Link to="/">
            <PixelButton variant="ghost" size="sm">
              {'< 메인으로'}
            </PixelButton>
          </Link>
        ) : (
          <span />
        )}

        <button
          type="button"
          className={MUTE_BUTTON_CLASSES}
          onClick={toggleMuted}
          aria-label={muted ? '소리 켜기' : '소리 끄기'}
        >
          {muted ? (
            <IconVolumeOff size={26} stroke={2} />
          ) : (
            <IconVolume size={26} stroke={2} />
          )}
        </button>
      </div>

      <div className="page-bg" style={{ backgroundImage: `url(${seasonBg})` }}>
        <main className={styles.page}>
          <div className={styles.frameStack}>
            {isContentRoute ? (
              <Outlet />
            ) : isMobile ? (
              <DSFrame maxWidth={dsFrameMaxWidth}>
                <GameFrameCard scale={scale}>{gameCardChildren}</GameFrameCard>
                {dsMenuRow}
                {/* PvP에선 D-pad가 고양이를 조작 — WASD 패드는 츄와와 유지. 솔로는 둘 다 츄. */}
                <VirtualController catControl={isPvpLocal} />
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
