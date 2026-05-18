import type { ReactNode } from 'react'
import clsx from 'clsx'

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

const ROOT_CLASSES =
  'inline-flex items-center justify-center font-bold border-[length:var(--button-border-width)] border-solid border-[color:var(--color-border-button)] rounded-[var(--radius-md)] cursor-pointer select-none whitespace-nowrap tracking-[0.02em] ' +
  'transition-[transform,box-shadow,background-color] duration-[var(--transition-fast)] ' +
  'font-[family-name:var(--font-body)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[color:var(--color-button-primary-bg)] text-[color:var(--color-button-primary-text)] shadow-[var(--shadow-button-rest)] ' +
    'hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-[var(--shadow-button-hover)] ' +
    'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-[var(--shadow-button-pressed)]',
  secondary:
    'bg-[color:var(--color-button-secondary-bg)] text-[color:var(--color-button-secondary-text)] shadow-[var(--shadow-button-rest)] ' +
    'hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-[var(--shadow-button-hover)] ' +
    'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-[var(--shadow-button-pressed)]',
  ghost:
    'bg-transparent text-[color:var(--color-button-ghost-text)] border-transparent shadow-none ' +
    'hover:enabled:bg-[color:var(--color-button-ghost-bg-hover)]',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)] text-[length:var(--text-sm)]',
  md: 'h-[var(--button-height-md)] px-[var(--button-padding-x-md)] text-[length:var(--text-md)]',
  lg: 'h-[var(--button-height-lg)] px-[var(--button-padding-x-lg)] text-[length:var(--text-lg)]',
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
  return (
    <button
      type={type}
      className={clsx(
        ROOT_CLASSES,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
