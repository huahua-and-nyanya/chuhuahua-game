import type { ReactNode } from 'react'
import styles from './PixelButton.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface PixelButtonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
}

export function PixelButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className,
}: PixelButtonProps) {
  const classes = [styles.root, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
