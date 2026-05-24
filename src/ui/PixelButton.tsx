import type { ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'arcade'
type Size = 'sm' | 'md' | 'lg'

interface PixelButtonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
  // arcade variant 전용 — 동적 색상(hex). 텍스트 색 + glow 둘 다.
  glowColor?: string
}

const ROOT_CLASSES =
  'inline-flex items-center justify-center font-bold font-body ' +
  'border-[length:var(--button-border-width)] border-solid border-border-button rounded-md ' +
  'cursor-pointer select-none whitespace-nowrap tracking-[0.02em] ' +
  'transition-[transform,box-shadow,background-color] duration-[var(--transition-fast)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

// arcade는 검정 배경 + 동적 컬러 텍스트 + glow. 기존 grid 진행(hover translate/shadow)은 유지.
const ARCADE_CLASSES =
  'bg-ink-base shadow-button-rest ' +
  'hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-button-hover ' +
  'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-button-pressed'

const VARIANT_CLASSES: Record<Exclude<Variant, 'arcade'>, string> = {
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
  glowColor,
}: PixelButtonProps) {
  const variantClass =
    variant === 'arcade' ? ARCADE_CLASSES : VARIANT_CLASSES[variant]
  const inlineStyle =
    variant === 'arcade'
      ? {
          color: glowColor ?? '#ffffff',
          textShadow: glowColor ? `0 0 8px ${glowColor}aa` : undefined,
        }
      : undefined
  return (
    <button
      type={type}
      className={clsx(
        ROOT_CLASSES,
        variantClass,
        SIZE_CLASSES[size],
        className,
      )}
      style={inlineStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
