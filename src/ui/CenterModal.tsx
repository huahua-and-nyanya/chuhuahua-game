import { useEffect, type ReactNode } from 'react'
import clsx from 'clsx'
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
  'p-[var(--gap-lg)] ' +
  'bg-[color:var(--color-bg-modal-backdrop)] ' +
  'animate-[backdrop-in_180ms_ease-out]'

const WRAPPER_CLASSES =
  'relative w-full max-w-[480px] ' +
  'animate-[card-in_220ms_ease-out] ' +
  '[filter:drop-shadow(var(--shadow-modal))]'

const CLOSE_CLASSES =
  'absolute -top-[18px] -right-[18px] z-[1] cursor-pointer ' +
  'inline-flex items-center justify-center leading-none ' +
  'w-[40px] h-[40px] rounded-[var(--radius-circle)] ' +
  'bg-[color:var(--color-pink-700)] text-[color:var(--color-text-on-pink)] ' +
  'border-[length:3px] border-solid border-[color:var(--color-ink-base)] ' +
  'font-[family-name:var(--font-body)] font-bold text-[length:var(--text-md)] ' +
  'shadow-[2px_2px_0_var(--color-ink-base)] ' +
  'transition-[transform,box-shadow] duration-[var(--transition-fast)] ' +
  'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-ink-base)] ' +
  'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-ink-base)]'

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
      className={clsx(BACKDROP_CLASSES)}
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="presentation"
    >
      <div
        className={clsx(WRAPPER_CLASSES)}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className={clsx(CLOSE_CLASSES)}
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
