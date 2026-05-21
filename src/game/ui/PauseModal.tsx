import { CHARACTER_ASSETS } from '@/assets'
import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

// 일시정지 모달 — 자는 츄와와 + "잠깐 쉬는 중" + ▶ 다시 놀기.
// ESC/배경 클릭으로 닫기 → onResume (solo.tsx가 resume 처리).
// CenterModal의 closeOnEscape는 false (solo.tsx의 ESC 키 핸들러가 통합 토글 책임).

export type PauseModalProps = {
  open: boolean
  onResume: () => void
}

export function PauseModal({ open, onResume }: PauseModalProps) {
  return (
    <CenterModal
      open={open}
      onClose={onResume}
      title="잠깐 쉬는 중"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-md p-md flex flex-col items-center text-center">
        <img
          src={CHARACTER_ASSETS.chihuahuaSleep}
          alt="자는 츄와와"
          className="h-32 w-32 object-contain"
        />
        <p className="text-text-muted font-body text-sm">
          츄와와도 한숨 돌리고 있어요
        </p>
        <PixelButton
          variant="arcade"
          size="lg"
          glowColor="#33ff66"
          onClick={onResume}
        >
          ▶ 다시 놀기
        </PixelButton>
        <p className="text-text-muted font-body mt-sm text-xs">
          ESC 키로도 다시 시작
        </p>
      </div>
    </CenterModal>
  )
}
