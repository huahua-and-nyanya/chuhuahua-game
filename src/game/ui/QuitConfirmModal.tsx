import { CHARACTER_ASSETS } from '@/assets'
import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

// 그만두기 확인 모달 — "정말 그만둘래?" + 더 놀래 / 그만 둘래.
// ESC = 취소(=더 놀래)는 solo.tsx의 통합 키 핸들러가 처리. 본 모달의 closeOnEscape는 false.
// 두 버튼 모두 PixelButton 기본 variant 사용 (secondary / primary).

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
        <div className="relative mx-auto h-40 w-40 overflow-hidden">
          <img
            src={CHARACTER_ASSETS.chihuahuaSad}
            alt="슬픈 츄와와"
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-text-primary font-body text-sm leading-relaxed">
          지금 그만두면
          <br />
          뽀뽀 도전이 끝나버려요!
        </p>
        <div className="gap-sm mt-sm flex w-full justify-center">
          <PixelButton variant="secondary" size="lg" onClick={onCancel}>
            더 놀래
          </PixelButton>
          <PixelButton
            className="w-full"
            variant="primary"
            size="lg"
            onClick={onConfirm}
          >
            그만 둘래
          </PixelButton>
        </div>
      </div>
    </CenterModal>
  )
}
