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
  'inline-flex items-center justify-center font-bold font-body ' +
  'border-[length:var(--button-border-width)] border-solid border-border-button rounded-md ' +
  'cursor-pointer select-none whitespace-nowrap tracking-[0.02em] ' +
  'transition-[transform,box-shadow,background-color] duration-[var(--transition-fast)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-button-primary-bg text-button-primary-text shadow-button-rest ' +
    'hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-button-hover ' +
    'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-button-pressed',
  secondary:
    'bg-button-secondary-bg text-button-secondary-text shadow-button-rest ' +
    'hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-button-hover ' +
    'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-button-pressed',
  ghost:
    'bg-transparent text-button-ghost-text border-transparent shadow-none ' +
    'hover:enabled:bg-button-ghost-bg-hover',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-button-sm px-button-px-sm text-sm',
  md: 'h-button-md px-button-px-md text-md',
  lg: 'h-button-lg px-button-px-lg text-lg',
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
