import { useEffect, useState } from 'react'

import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'

// 카드 외곽 width(viewport에 맞춰 자동)에 대해 좌표계(GAME_WIDTH=640) 기준 inner wrapper를
// 정확히 채우기 위한 scale 값. transform: scale(scale) + transformOrigin: top left.
//
// 카드 width = min(가용 가로, 가용 세로 × 4/3, 좌표계 × MAX_SCALE).
// 가용 세로 = viewport height − page padding × 2 − 예약 영역.
//   - 데스크탑: 메인으로 버튼 자리 + 위쪽 여유 (DESKTOP_HEADER_RESERVED)
//   - 모바일: DS 프레임 내부 overhead (DS_OVERHEAD_MOBILE)
//     padding 24 + gap 12 × 2 + 메뉴 row 36 + 컨트롤러 100 + border 4 = 188
// 가용 가로 = viewport width − page padding × 2 − (모바일: DSFRAME_HORIZONTAL_OVERHEAD)
//   DSFRAME_HORIZONTAL_OVERHEAD = padding 24 + border 4 = 28
//   DSFrame은 viewport 가로 한계치(- page padding 32)까지 꽉 채움. cap 없음.
//   카드는 그 안 폭(DSFrame width - overhead) 또는 vh 한계 중 작은 값.
//
// 모바일(viewport 375×667): DSFrame 343 → 안 폭 315, vh 가용 447, 카드 315 (scale ~0.492)
// 모바일(viewport 414×600 가로 큰 작은 폰): DSFrame 382 → 안 폭 354, vh 가용 380, widthByH 507 → 카드 354
// 데스크탑(viewport 1920×1080): 가용 1888 × 948 → 카드 960 (MAX_SCALE 1.5)
//
// 좌표계는 항상 640×480 — 게임 로직/충돌은 0% 영향.
const PAGE_PADDING = 16
const MOBILE_BREAKPOINT = 768
// DS 프레임 좌우 overhead — p-md 24 + border 2 × 2 = 28
const DSFRAME_HORIZONTAL_OVERHEAD = 28
// DS 프레임 안 vertical overhead — p-md 24 + gap-md 12 × 2 + 메뉴 row 36 + 컨트롤러 100 + border 4
const DS_OVERHEAD_MOBILE = 24 + 12 + 12 + 36 + 100 + 4
// 데스크탑 헤더 영역 예약 (메인으로 버튼 + 위쪽 여유, 스크롤 발생 방지)
const DESKTOP_HEADER_RESERVED = 100
const MAX_SCALE = 1.5

export type ResponsiveLayout = {
  scale: number
  isMobile: boolean
}

const DESKTOP_DEFAULT: ResponsiveLayout = { scale: 1, isMobile: false }

function compute(): ResponsiveLayout {
  if (typeof window === 'undefined') return DESKTOP_DEFAULT
  const vw = window.innerWidth
  const vh = window.innerHeight
  const isMobile = vw < MOBILE_BREAKPOINT

  // 모바일은 DSFrame이 viewport - page padding 한계치까지 꽉 채움 (cap 없음).
  // 카드는 그 안 폭 = DSFrame width - overhead 안에 정확히 들어가야 함.
  const horizontalRaw = vw - PAGE_PADDING * 2
  const availW = isMobile
    ? horizontalRaw - DSFRAME_HORIZONTAL_OVERHEAD
    : horizontalRaw
  const availH =
    vh -
    PAGE_PADDING * 2 -
    (isMobile ? DS_OVERHEAD_MOBILE : DESKTOP_HEADER_RESERVED)

  // aspect 4:3 → 카드 width = 가용 height × 4/3
  const widthByHeight = (availH * GAME_WIDTH) / GAME_HEIGHT
  const cardWidth = Math.min(availW, widthByHeight, GAME_WIDTH * MAX_SCALE)
  return { scale: cardWidth / GAME_WIDTH, isMobile }
}

export function useResponsiveScale(): ResponsiveLayout {
  // lazy init — 첫 렌더부터 viewport 실측값 사용 (모바일 새로고침 시 데스크탑 가정으로
  // 잠깐 그려지는 회귀 방지). SSR 가드는 compute() 안에서 처리.
  const [layout, setLayout] = useState<ResponsiveLayout>(() => compute())
  useEffect(() => {
    const update = () => setLayout(compute())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return layout
}
