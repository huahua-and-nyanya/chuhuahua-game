import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

// 그만두기 확인 모달 — "정말 그만둘래?" + 더 놀래 / 그만 둘래.
// ESC = 취소(=더 놀래)는 solo.tsx의 통합 키 핸들러가 처리. 본 모달의 closeOnEscape는 false.
// "그만 둘래"는 arcade variant + 빨간 glow (danger variant 미존재 — arcade로 대체).

export type QuitConfirmModalProps = {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function QuitConfirmModal({
  open,
  onCancel,
  onConfirm,
}: QuitConfirmModalProps) {
  return (
    <CenterModal
      open={open}
      onClose={onCancel}
      title="정말 그만둘래?"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-md p-md flex flex-col items-center text-center">
        <p className="text-text-primary font-body text-sm leading-relaxed">
          지금 그만두면
          <br />
          뽀뽀 도전이 끝나버려요!
        </p>
        <div className="gap-md mt-sm flex">
          <PixelButton variant="secondary" onClick={onCancel}>
            더 놀래
          </PixelButton>
          <PixelButton variant="arcade" glowColor="#ff3344" onClick={onConfirm}>
            그만 둘래
          </PixelButton>
        </div>
      </div>
    </CenterModal>
  )
}
