import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PixelButton } from '@/ui/PixelButton'
import { PixelCard } from '@/ui/PixelCard'
import { PixelChip } from '@/ui/PixelChip'
import { CoinChip } from '@/ui/CoinChip'
import { IconCostButton } from '@/ui/IconCostButton'
import { GridCard } from '@/ui/GridCard'
import { CenterModal } from '@/ui/CenterModal'
import { GameFrame } from '@/ui/GameFrame'
import { NavButton } from '@/ui/NavButton'
import { IconNavButton } from '@/ui/IconNavButton'
import type { ClothEntry } from '@/features/wardrobe/types'
import { COIN_ICON_PATH, CAPSULE_ICON_PATH } from '@/assets/clothes'
import { ICON_ASSETS, MAIN_HERO } from '@/assets'
import { MultiplayerSelectModal } from '../-components/MultiplayerSelectModal'
import { PreviewSection, PreviewRow } from './-components/PreviewLayout'

export const Route = createFileRoute('/dev/ui-preview')({
  component: UiPreviewPage,
})

const VARIANTS = ['primary', 'secondary', 'ghost'] as const
const SIZES = ['sm', 'md', 'lg'] as const

const DEMO_CLOTHES = {
  bUnowned: {
    id: 'demo-b',
    name: '평범한 모자',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
  },
  aOwned: {
    id: 'demo-a',
    name: '천사 날개',
    grade: 'A',
    pair: false,
    applyTo: 'idle',
  },
  sEquipped: {
    id: 'demo-s',
    name: '분노 츄와와',
    grade: 'S',
    pair: false,
    applyTo: 'idle',
  },
  splusPairEquipped: {
    id: 'demo-splus',
    name: '커플 후드',
    grade: 'S+',
    pair: true,
    applyTo: 'all',
  },
} as const satisfies Record<string, ClothEntry>

function UiPreviewPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [multiOpen, setMultiOpen] = useState(false)
  return (
    <main
      style={{
        padding: 'var(--gap-xl)',
        minHeight: '100dvh',
        background: 'var(--color-bg-frame)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-xl)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          margin: 0,
        }}
      >
        UI Preview
      </h1>

      <PreviewSection title="PixelButton">
        {VARIANTS.map((v) => (
          <PreviewRow key={v} label={v}>
            {SIZES.map((s) => (
              <PixelButton key={s} variant={v} size={s}>
                {`${v}-${s}`}
              </PixelButton>
            ))}
            <PixelButton variant={v} disabled>
              disabled
            </PixelButton>
          </PreviewRow>
        ))}
      </PreviewSection>

      <PreviewSection title="PixelCard">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--gap-lg)',
          }}
        >
          <PixelCard>헤더 없는 단순 카드</PixelCard>
          <PixelCard header="영수증">
            본문 영역에 점선 보더 + 그림자가 적용된 카드.
          </PixelCard>
        </div>
      </PreviewSection>

      <PreviewSection title="PixelChip">
        <PreviewRow label="variants">
          <PixelChip>default</PixelChip>
          <PixelChip variant="disabled">disabled</PixelChip>
          <PixelChip variant="danger">danger</PixelChip>
          <PixelChip>준비 중</PixelChip>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="GridCard">
        <PreviewRow label="4분기 (B 미보유 / A 보유 / S 장착 / S+ 페어 장착)">
          <div className="grid w-[360px] max-w-full grid-cols-3 gap-2">
            <GridCard
              cloth={DEMO_CLOTHES.bUnowned}
              owned={false}
              equipped={false}
            />
            <GridCard
              cloth={DEMO_CLOTHES.aOwned}
              owned={true}
              equipped={false}
              objectSrc={COIN_ICON_PATH}
            />
            <GridCard
              cloth={DEMO_CLOTHES.sEquipped}
              owned={true}
              equipped={true}
              objectSrc={COIN_ICON_PATH}
            />
            <GridCard
              cloth={DEMO_CLOTHES.splusPairEquipped}
              owned={true}
              equipped={true}
              objectSrc={COIN_ICON_PATH}
            />
          </div>
        </PreviewRow>
        <PreviewRow label="owned + no objectSrc (이미지 미준비 옷)">
          <div className="grid w-[360px] max-w-full grid-cols-3 gap-2">
            <GridCard
              cloth={DEMO_CLOTHES.aOwned}
              owned={true}
              equipped={false}
            />
          </div>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="CoinChip">
        <PreviewRow label="solid (기본)">
          <CoinChip amount={0} size="sm" />
          <CoinChip amount={42} size="sm" />
          <CoinChip amount={999} size="md" />
          <CoinChip amount={9999} size="md" />
        </PreviewRow>
        <PreviewRow label="floating (반투명 — 게임 화면 위)">
          <div
            style={{
              display: 'flex',
              gap: 'var(--gap-md)',
              alignItems: 'center',
              padding: 'var(--gap-lg)',
              background: 'var(--color-pink-100)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <CoinChip amount={150} size="sm" floating />
            <CoinChip amount={150} size="md" floating />
          </div>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="IconCostButton">
        <PreviewRow label="md (가챠 버튼 가정 — enabled / disabled)">
          <IconCostButton
            iconSrc={CAPSULE_ICON_PATH}
            label="가챠"
            cost={15}
            onClick={() => undefined}
          />
          <IconCostButton
            iconSrc={CAPSULE_ICON_PATH}
            label="가챠"
            cost={15}
            disabled
            onClick={() => undefined}
          />
        </PreviewRow>
        <PreviewRow label="sm (옷장 내 액션 가정 — enabled / disabled)">
          <IconCostButton
            iconSrc={CAPSULE_ICON_PATH}
            label="가챠"
            cost={15}
            size="sm"
            onClick={() => undefined}
          />
          <IconCostButton
            iconSrc={CAPSULE_ICON_PATH}
            label="가챠"
            cost={15}
            size="sm"
            disabled
            onClick={() => undefined}
          />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="NavButton">
        <PreviewRow label="vertical stack">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--nav-button-gap)',
            }}
          >
            <NavButton label="혼자서" onClick={() => undefined} />
            <NavButton label="둘이서" onClick={() => undefined} />
            <NavButton label="옷장" onClick={() => undefined} />
            <NavButton label="비활성" disabled onClick={() => undefined} />
          </div>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="IconNavButton">
        <PreviewRow label="default + disabled">
          <IconNavButton
            icon={ICON_ASSETS.ranking}
            alt="랭킹"
            onClick={() => undefined}
          />
          <IconNavButton
            icon={ICON_ASSETS.help}
            alt="게임 방법"
            onClick={() => undefined}
          />
          <IconNavButton
            icon={ICON_ASSETS.help}
            alt="비활성"
            disabled
            onClick={() => undefined}
          />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="GameFrame">
        <GameFrame
          cornerActions={
            <>
              <IconNavButton
                icon={ICON_ASSETS.ranking}
                alt="랭킹"
                onClick={() => undefined}
              />
              <IconNavButton
                icon={ICON_ASSETS.help}
                alt="게임 방법"
                onClick={() => undefined}
              />
            </>
          }
          sideMenu={
            <>
              <NavButton label="혼자서" onClick={() => undefined} />
              <NavButton label="둘이서" onClick={() => undefined} />
              <NavButton label="옷장" onClick={() => undefined} />
            </>
          }
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-muted)',
            }}
          >
            캐릭터 영역 (placeholder)
          </span>
        </GameFrame>

        <GameFrame background={`url(${MAIN_HERO}) center / cover no-repeat`}>
          <span style={{ color: 'var(--color-text-on-pink)' }}>
            background prop (url)
          </span>
        </GameFrame>
      </PreviewSection>

      <PreviewSection title="CenterModal">
        <PreviewRow label="trigger">
          <PixelButton onClick={() => setModalOpen(true)}>
            모달 열기
          </PixelButton>
        </PreviewRow>
        <CenterModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="모달 타이틀"
        >
          <p>ESC / 바깥 클릭 / X 버튼으로 닫힘</p>
          <p
            style={{
              color: 'var(--color-text-muted)',
              marginTop: 'var(--gap-sm)',
            }}
          >
            열려있는 동안 body 스크롤 잠김
          </p>
        </CenterModal>
      </PreviewSection>

      <PreviewSection title="MultiplayerSelectModal">
        <PreviewRow label="trigger">
          <PixelButton onClick={() => setMultiOpen(true)}>
            둘이서 모달
          </PixelButton>
        </PreviewRow>
        <MultiplayerSelectModal
          open={multiOpen}
          onClose={() => setMultiOpen(false)}
        />
      </PreviewSection>
    </main>
  )
}
