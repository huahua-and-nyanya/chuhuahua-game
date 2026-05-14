import { useEffect, type ReactNode } from 'react'
import { PixelCard } from './PixelCard'
import styles from './CenterModal.module.css'

interface CenterModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
}

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
      className={styles.backdrop}
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="presentation"
    >
      <div
        className={styles.wrapper}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className={styles.close}
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
