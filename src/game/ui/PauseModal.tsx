import { CHARACTER_ASSETS } from '@/assets'
import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

import '@/game/keyframes.css'

// 일시정지 모달 — 자는 츄와와 + Z 버블 stagger + ▶ 다시 놀기 (PixelButton primary).
// ESC/배경 클릭으로 닫기 → onResume (라우트가 resume 처리).
// CenterModal의 closeOnEscape는 false — 라우트의 ESC 키 핸들러가 통합 토글 책임.
//
// mode 분기:
//   - 'solo' (default): 자는 츄와와 + "잠깐 쉬는 중..." — 솔로 ESC 지원이라 ESC 안내 표시
//   - 'pvp': 함께 자는 츄와/냐 + "잠시 휴전중..." — PvP ESC 미지원이라 ESC 안내 미표시

export type PauseModalMode = 'solo' | 'pvp'

export type PauseModalProps = {
  open: boolean
  onResume: () => void
  mode?: PauseModalMode
}

export function PauseModal({ open, onResume, mode = 'solo' }: PauseModalProps) {
  const isPvp = mode === 'pvp'
  const title = isPvp ? '잠시 휴전중...' : '잠깐 쉬는 중...'
  const imageSrc = isPvp
    ? CHARACTER_ASSETS.withSleep
    : CHARACTER_ASSETS.chihuahuaSleep
  const imageAlt = isPvp ? '함께 자는 츄와와와 고양이' : '자는 츄와와'
  const subText = isPvp ? '잠깐 쉬어가는 중' : '츄와와도 한숨 돌리고 있어요'
  return (
    <CenterModal
      open={open}
      onClose={onResume}
      title={title}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-md p-md flex flex-col items-center text-center">
        <div className="relative mx-auto h-40 w-40 overflow-hidden">
          <img
            src={imageSrc}
            alt={imageAlt}
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
        <p className="text-text-muted font-body text-sm">{subText}</p>
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
          {!isPvp && (
            <p className="mt-xs font-body text-[8px] text-[#BFBFBF]">
              ESC 키로도 다시 시작
            </p>
          )}
        </div>
      </div>
    </CenterModal>
  )
}
