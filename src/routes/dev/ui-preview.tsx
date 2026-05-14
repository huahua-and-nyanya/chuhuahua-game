import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PixelButton } from '@/ui/PixelButton'
import { PixelCard } from '@/ui/PixelCard'
import { PixelChip } from '@/ui/PixelChip'
import { CenterModal } from '@/ui/CenterModal'
import { GameFrame } from '@/ui/GameFrame'
import { NavButton } from '@/ui/NavButton'
import { IconNavButton } from '@/ui/IconNavButton'
import { ICON_ASSETS } from '@/assets'
import { MultiplayerSelectModal } from '../-components/MultiplayerSelectModal'
import { PreviewSection, PreviewRow } from './-components/PreviewLayout'

export const Route = createFileRoute('/dev/ui-preview')({
  component: UiPreviewPage,
})

const VARIANTS = ['primary', 'secondary', 'ghost'] as const
const SIZES = ['sm', 'md', 'lg'] as const

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
          bottomMenu={
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
