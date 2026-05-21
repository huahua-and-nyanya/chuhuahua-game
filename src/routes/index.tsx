import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { ICON_ASSETS, MAIN_HERO } from '@/assets'
import { useCoins } from '@/features/coins/useCoins'
import { CenterModal } from '@/ui/CenterModal'
import { CoinChip } from '@/ui/CoinChip'
import { IconNavButton } from '@/ui/IconNavButton'
import { NavButton } from '@/ui/NavButton'

import { MultiplayerSelectModal } from './-components/MultiplayerSelectModal'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// 카드 내부 100% 메인 책임. 카드 외곽/외부 헤더는 __root.tsx가 책임.
// 슬롯 위치 클래스는 GameFrame이 갖던 패턴 그대로 인라인 (top/left/right/bottom-frame-inner).
// 시각은 GameFrame을 거치던 기존 메인과 동일.
const BACKGROUND_CLASSES = 'pointer-events-none absolute inset-0'
const TOP_LEFT_CLASSES =
  'absolute top-frame-inner left-frame-inner flex flex-row gap-sm z-[2]'
const CORNER_ACTIONS_CLASSES =
  'absolute top-frame-inner right-frame-inner flex flex-row gap-sm z-[2] max-md:hidden'
const SIDE_MENU_CLASSES =
  'absolute right-frame-inner bottom-frame-inner flex flex-col gap-nav-button-gap z-[2] max-md:hidden'

function HomePage() {
  const navigate = useNavigate()
  const { coins } = useCoins()
  const [multiOpen, setMultiOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [rankingOpen, setRankingOpen] = useState(false)

  return (
    <>
      <div
        className={BACKGROUND_CLASSES}
        style={{ background: `url(${MAIN_HERO}) center / cover no-repeat` }}
      />

      <div className={TOP_LEFT_CLASSES}>
        <CoinChip amount={coins} size="md" className="max-md:hidden" />
        <CoinChip amount={coins} size="sm" className="md:hidden" />
      </div>

      <div className={CORNER_ACTIONS_CLASSES}>
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
      </div>

      <div className={SIDE_MENU_CLASSES}>
        <NavButton label="혼자서" onClick={() => navigate({ to: '/solo' })} />
        <NavButton label="둘이서" onClick={() => setMultiOpen(true)} />
        <NavButton label="옷장" onClick={() => navigate({ to: '/wardrobe' })} />
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
    </>
  )
}
