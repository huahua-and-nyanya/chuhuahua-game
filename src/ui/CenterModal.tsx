import { useEffect, type ReactNode } from 'react'
import { PixelCard } from './PixelCard'

interface CenterModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
}

const BACKDROP_CLASSES =
  'fixed inset-0 flex items-center justify-center z-[100] ' +
  'p-lg bg-bg-modal-backdrop animate-backdrop-in'

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

  return (
    <div
      className={BACKDROP_CLASSES}
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
        <button
          type="button"
          className={CLOSE_CLASSES}
          onClick={onClose}
          aria-label="닫기"
        >
          X
        </button>
        <PixelCard header={title}>{children}</PixelCard>
      </div>
    </div>
  )
}
