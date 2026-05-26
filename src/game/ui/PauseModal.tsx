import { CHARACTER_ASSETS } from '@/assets'
import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

import '@/game/keyframes.css'

// 일시정지 모달 — 자는 츄와와 + Z 버블 stagger + ▶ 다시 놀기 (PixelButton primary).
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
      title="잠깐 쉬는 중..."
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-md p-md flex flex-col items-center text-center">
        <div className="relative mx-auto h-40 w-40 overflow-hidden">
          <img
            src={CHARACTER_ASSETS.chihuahuaSleep}
            alt="자는 츄와와"
            className="h-full w-full object-contain"
          />
          {/* Z 버블 — 3개가 0.8s 간격 stagger로 위로 올라가며 커지고 사라짐 */}
          <span className="z-bubble z-bubble-1" aria-hidden>
            Z
          </span>
          <span className="z-bubble z-bubble-2" aria-hidden>
            Z
          </span>
          <span className="z-bubble z-bubble-3" aria-hidden>
            Z
          </span>
        </div>
        <p className="text-text-muted font-body text-sm">
          츄와와도 한숨 돌리고 있어요
        </p>
        <div className="flex w-full flex-col items-center gap-2">
          <div className="gap-sm flex w-full justify-center">
            <PixelButton
              className="w-full"
              variant="primary"
              size="lg"
              onClick={onResume}
            >
              ▶ 다시 놀기
            </PixelButton>
          </div>
          <p className="mt-xs font-body text-[8px] text-[#BFBFBF]">
            ESC 키로도 다시 시작
          </p>
        </div>
      </div>
    </CenterModal>
  )
}
