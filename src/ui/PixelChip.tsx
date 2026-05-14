import type { ReactNode } from 'react'
import styles from './PixelChip.module.css'

type ChipVariant = 'default' | 'disabled' | 'danger'

interface PixelChipProps {
  children: ReactNode
  variant?: ChipVariant
  className?: string
}

export function PixelChip({
  children,
  variant = 'default',
  className,
}: PixelChipProps) {
  const classes = [styles.root, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{children}</span>
}
