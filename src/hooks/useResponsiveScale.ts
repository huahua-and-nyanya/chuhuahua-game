import { useEffect, useState } from 'react'

import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'

// 카드 외곽 width(viewport에 맞춰 자동)에 대해 좌표계(GAME_WIDTH=640) 기준 inner wrapper를
// 정확히 채우기 위한 scale 값. transform: scale(scale) + transformOrigin: top left.
//
// 카드 width = min(가용 가로, 가용 세로 × 4/3, 좌표계 × MAX_SCALE).
// 가용 세로 = viewport height − page padding × 2 − 예약 영역.
//   - 데스크탑: 메인으로 버튼 자리 + 위쪽 여유 (DESKTOP_HEADER_RESERVED)
//   - 모바일: DS 프레임 내부 overhead = 고정값 + 컨트롤러 높이
//     고정: pt-md 12 + pb-2xl 32 + gap-2xl 32 × 2 + 메뉴 row 36 = 144
//     컨트롤러: VirtualController는 flex-1 + aspect-square, --virtual-pad-size(140) 캡.
//              한 변 = min((DSFrame 안 폭 - gap-sm 8)/2, VIRTUAL_PAD_MAX)
//              캡 두는 이유 — 큰 viewport에서 패드가 무한정 자라면 게임 카드 vh가 압박됨.
// 가용 가로 = viewport width − page padding × 2 − (모바일: DSFRAME_HORIZONTAL_OVERHEAD)
//   DSFRAME_HORIZONTAL_OVERHEAD = p-md 24 (PNG가 외곽 담당 — CSS border 없음)
//   DSFrame은 viewport 가로 한계치(- page padding 32)까지 꽉 채움. cap 없음.
//   카드는 그 안 폭 또는 vh 한계 중 작은 값.
//
// 모바일(375×667): DSFrame 343 → 안 폭 319, 패드 140(캡), vh 가용 351, 카드 319 (h bottleneck)
// 모바일(320×568): DSFrame 288 → 안 폭 264, 패드 128, vh 가용 264, 카드 264 (h bottleneck)
// 모바일(414×600): DSFrame 382 → 안 폭 358, 패드 140(캡), vh 가용 284, 카드 358 (h bottleneck)
// 데스크탑(1920×1080): 가용 1888 × 948 → 카드 960 (MAX_SCALE 1.5)
//
// 좌표계는 항상 640×480 — 게임 로직/충돌은 0% 영향.
const PAGE_PADDING = 16
const MOBILE_BREAKPOINT = 768
// DS 프레임 좌우 overhead — p-md 24 (PNG 외곽이라 CSS border 없음)
const DSFRAME_HORIZONTAL_OVERHEAD = 24
// DS 프레임 안 vertical 고정 overhead — pt-md 12 + pb-2xl 32 + gap-2xl 32 × 2 + 메뉴 row 36
const DS_VERTICAL_FIXED_OVERHEAD = 12 + 32 + 32 * 2 + 36
// VirtualController row 안 두 패드 사이 gap-sm
const PAD_ROW_GAP = 8
// VirtualController row 좌우 padding — px-md 12 × 2 = 24
const PAD_ROW_HORIZONTAL_PADDING = 24
// 가상 패드 한 변 max — tokens.css `--virtual-pad-size` 와 동기화 필수.
const VIRTUAL_PAD_MAX = 140
// 데스크탑 헤더 영역 예약 (메인으로 버튼 + 위쪽 여유, 스크롤 발생 방지)
const DESKTOP_HEADER_RESERVED = 100
const MAX_SCALE = 1.5

export type ResponsiveLayout = {
  scale: number
  isMobile: boolean
  // 모바일 DSFrame 외곽 max-width — 게임 카드 폭 + DSFRAME_HORIZONTAL_OVERHEAD.
  // viewport가 카드보다 훨씬 넓을 때 DSFrame이 카드를 살짝 감싸는 비율 유지.
  // 데스크탑은 의미 없음 (0 placeholder).
  dsFrameMaxWidth: number
}

const DESKTOP_DEFAULT: ResponsiveLayout = {
  scale: 1,
  isMobile: false,
  dsFrameMaxWidth: 0,
}

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
  // 모바일: 패드 한 변 = min((row inner 폭 - row gap)/2, --virtual-pad-size 캡).
  // row inner 폭 = DSFrame 안 폭 - row 좌우 padding.
  // 캡 안 걸리면 flex-1로 row 폭 절반씩, 걸리면 캡 + justify-between으로 가운데 공백.
  const controllerH = isMobile
    ? Math.min(
        Math.floor(
          (availW - PAD_ROW_HORIZONTAL_PADDING - PAD_ROW_GAP) / 2,
        ),
        VIRTUAL_PAD_MAX,
      )
    : 0
  const availH =
    vh -
    PAGE_PADDING * 2 -
    (isMobile
      ? DS_VERTICAL_FIXED_OVERHEAD + controllerH
      : DESKTOP_HEADER_RESERVED)

  // aspect 4:3 → 카드 width = 가용 height × 4/3
  const widthByHeight = (availH * GAME_WIDTH) / GAME_HEIGHT
  const cardWidth = Math.min(availW, widthByHeight, GAME_WIDTH * MAX_SCALE)
  // DSFrame은 카드 폭 + horizontal overhead로 cap — 큰 viewport에서 카드가 vh로 작아져도
  // DSFrame이 카드를 살짝 감싸는 비율 유지 (viewport 폭에 무조건 늘어나 카드만 가운데 쪼그라드는 회귀 방지).
  const dsFrameMaxWidth = cardWidth + DSFRAME_HORIZONTAL_OVERHEAD
  return { scale: cardWidth / GAME_WIDTH, isMobile, dsFrameMaxWidth }
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
