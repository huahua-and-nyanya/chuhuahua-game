import { createFileRoute } from '@tanstack/react-router'
import { PixelButton } from '@/ui/PixelButton'
import { PixelCard } from '@/ui/PixelCard'

export const Route = createFileRoute('/dev/ui-preview')({
  component: UiPreviewPage,
})

const VARIANTS = ['primary', 'secondary', 'ghost'] as const
const SIZES = ['sm', 'md', 'lg'] as const

function UiPreviewPage() {
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
      <header>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            margin: 0,
          }}
        >
          UI Preview
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--gap-xs)' }}>
          공용 컴포넌트 시각 회귀 확인용 (prod 빌드에도 포함, 메뉴 진입점 없음)
        </p>
      </header>

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
    </main>
  )
}

function PreviewSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-md)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function PreviewRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-sm)',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          gap: 'var(--gap-md)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {children}
      </div>
    </div>
  )
}
