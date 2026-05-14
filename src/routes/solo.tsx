import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PixelButton } from '@/ui/PixelButton'

export const Route = createFileRoute('/solo')({
  component: SoloPage,
})

function SoloPage() {
  const navigate = useNavigate()
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: 'var(--gap-lg)' }}>
        <PixelButton variant="ghost" onClick={() => navigate({ to: '/' })}>
          {'< 메인으로'}
        </PixelButton>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text-primary)',
        }}
      >
        솔로 엔드리스 — 준비 중
      </div>
    </main>
  )
}
