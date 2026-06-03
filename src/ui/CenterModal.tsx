import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PixelCard } from './PixelCard'

interface CenterModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  // false면 X 닫기 버튼 미렌더 — 강제 모달(온보딩 등)에서 backdrop/escape 비활성과 함께 사용.
  showClose?: boolean
  // 기본 z-index(100) 위로 모달을 쌓을 때 사용. 인라인 style이 클래스 z를 덮어씀.
  zIndex?: number
}

const BACKDROP_CLASSES =
  'fixed inset-0 flex items-center justify-center z-[100] ' +
  // p-7(28px): 닫기 버튼이 wrapper 밖으로 -18px 튀어나오므로, 모바일(wrapper ≈ 화면폭)에서
  // 상/우 X가 화면 밖으로 잘리지 않게 여백 확보.
  'p-7 bg-bg-modal-backdrop animate-backdrop-in'

const WRAPPER_CLASSES =
  'relative w-full max-w-[480px] animate-card-in drop-shadow-modal'

const CLOSE_CLASSES =
  'absolute -top-[18px] -right-[18px] z-[1] cursor-pointer ' +
  'inline-flex items-center justify-center leading-none ' +
  'w-[40px] h-[40px] rounded-full ' +
  'bg-pink-700 text-text-on-pink ' +
  'border-[3px] border-solid border-ink-base ' +
  'font-body font-bold text-md ' +
  'shadow-close-rest ' +
  'transition-[transform,box-shadow] duration-[var(--transition-fast)] ' +
  'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-close-hover ' +
  'active:translate-x-[1px] active:translate-y-[1px] active:shadow-close-pressed'

export function CenterModal({
  open,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showClose = true,
  zIndex,
}: CenterModalProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose, closeOnEscape])

  if (!open) return null
  if (typeof document === 'undefined') return null

  // 게임 프레임(GameFrameCard)이 transform: scale로 stacking context를 만들어
  // position: fixed 자식을 프레임 안에 가둔다. document.body로 portal해 프레임 밖
  // 전체 화면 오버레이로 띄운다 (옷장이 프레임 자식이 된 W-5 이후 회귀 차단).
  return createPortal(
    <div
      className={BACKDROP_CLASSES}
      style={zIndex !== undefined ? { zIndex } : undefined}
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="presentation"
    >
      <div
        className={WRAPPER_CLASSES}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {showClose && (
          <button
            type="button"
            className={CLOSE_CLASSES}
            onClick={onClose}
            aria-label="닫기"
          >
            X
          </button>
        )}
        <PixelCard header={title}>{children}</PixelCard>
      </div>
    </div>,
    document.body,
  )
}
