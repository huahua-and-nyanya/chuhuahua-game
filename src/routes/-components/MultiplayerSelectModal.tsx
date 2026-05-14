import { useNavigate } from '@tanstack/react-router'
import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'
import { PixelChip } from '@/ui/PixelChip'

interface MultiplayerSelectModalProps {
  open: boolean
  onClose: () => void
}

export function MultiplayerSelectModal({
  open,
  onClose,
}: MultiplayerSelectModalProps) {
  const navigate = useNavigate()

  const goLocal = () => {
    onClose()
    navigate({ to: '/multi/local' })
  }

  return (
    <CenterModal open={open} onClose={onClose} title="둘이서">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap-md)',
        }}
      >
        <PixelButton size="lg" onClick={goLocal}>
          로컬 둘이서
        </PixelButton>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--gap-sm)',
          }}
        >
          <PixelButton size="lg" disabled onClick={() => undefined}>
            온라인 랜덤
          </PixelButton>
          <PixelChip variant="disabled">준비 중</PixelChip>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--gap-sm)',
          }}
        >
          <PixelButton size="lg" disabled onClick={() => undefined}>
            온라인 방
          </PixelButton>
          <PixelChip variant="disabled">준비 중</PixelChip>
        </div>
      </div>
    </CenterModal>
  )
}
