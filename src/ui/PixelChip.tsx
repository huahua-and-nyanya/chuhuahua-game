import type { ReactNode } from 'react'
import clsx from 'clsx'

type ChipVariant = 'default' | 'disabled' | 'danger'

interface PixelChipProps {
  children: ReactNode
  variant?: ChipVariant
  className?: string
}

const ROOT_CLASSES =
  'inline-flex items-center justify-center font-bold whitespace-nowrap select-none ' +
  'font-[family-name:var(--font-body)] text-[length:var(--text-xs)] tracking-[0.04em] ' +
  'min-h-[22px] py-[2px] px-[var(--gap-sm)] ' +
  'rounded-[var(--radius-pill)] border-[length:2px] border-solid border-[color:var(--color-ink-base)]'

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  default:
    'bg-[color:var(--color-chip-default-bg)] text-[color:var(--color-chip-default-text)]',
  disabled:
    'bg-[color:var(--color-chip-disabled-bg)] text-[color:var(--color-chip-disabled-text)] border-[color:var(--color-chip-disabled-text)]',
  danger:
    'bg-[color:var(--color-chip-danger-bg)] text-[color:var(--color-chip-danger-text)]',
}

export function PixelChip({
  children,
  variant = 'default',
  className,
}: PixelChipProps) {
  return (
    <span className={clsx(ROOT_CLASSES, VARIANT_CLASSES[variant], className)}>
      {children}
    </span>
  )
}
