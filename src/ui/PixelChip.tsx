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
  'font-body text-xs tracking-[0.04em] ' +
  'min-h-[22px] py-0.5 px-sm ' +
  'rounded-pill border-2 border-solid border-ink-base'

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  default: 'bg-chip-default-bg text-chip-default-text',
  disabled:
    'bg-chip-disabled-bg text-chip-disabled-text border-chip-disabled-text',
  danger: 'bg-chip-danger-bg text-chip-danger-text',
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
