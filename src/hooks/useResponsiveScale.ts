import { useEffect, useState } from 'react'

import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'

// 카드 외곽 width(viewport에 맞춰 자동)에 대해 좌표계(GAME_WIDTH=640) 기준 inner wrapper를
// 정확히 채우기 위한 scale 값. transform: scale(scale) + transformOrigin: top left.
//
// 카드 width = min(가용 가로, 가용 세로 × 4/3, 좌표계 × MAX_SCALE).
// 가용 세로 = viewport height − page padding × 2 − 예약 영역.
//   - 데스크탑: 메인으로 버튼 자리 + 위쪽 여유 (DESKTOP_HEADER_RESERVED)
//   - 모바일: DS 하단 ControllerCard 영역 (CONTROLLER_HEIGHT)
//     (메뉴 row + WASD/D-pad + padding 포함 안전값)
// 위 예약으로 viewport 안에 스크롤 없이 다 들어감.
//
// 데스크탑(viewport 1920×1080): 가용 ~1888 × ~948 → 카드 960 (MAX_SCALE 1.5)
// 좁은 데스크탑(viewport 1280×800): 가용 ~1248 × ~668 → 카드 ~890 (height 한도)
// 모바일(viewport 375×667): 가용 ~343 × ~455 → 카드 343 (width 한도, scale ~0.536)
//
// 좌표계는 항상 640×480 — 게임 로직/충돌은 0% 영향.
const PAGE_PADDING = 16
const MOBILE_BREAKPOINT = 768
// 모바일 ControllerCard 예약 — WASD/D-pad 104 + py-md 24 + 메뉴 row(NavButton 32) + gap-md 12 + border 8 = ~180.
// 메뉴 row 없을 때(/solo 등)는 컨트롤러 카드가 자연스럽게 짧아져도 reservedH는 안전값으로 유지.
const CONTROLLER_HEIGHT = 180
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
  const reservedH = isMobile ? CONTROLLER_HEIGHT : DESKTOP_HEADER_RESERVED

  const availW = vw - PAGE_PADDING * 2
  const availH = vh - PAGE_PADDING * 2 - reservedH

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
