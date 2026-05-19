import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PixelCardProps {
  children: ReactNode
  header?: ReactNode
  className?: string
}

const ROOT_CLASSES =
  'flex flex-col overflow-hidden ' +
  'bg-[color:var(--color-bg-card)] ' +
  'border-[length:2px] border-dashed border-[color:var(--color-border-card)] ' +
  'rounded-[var(--radius-md)] shadow-[var(--shadow-card)]'

const HEADER_CLASSES =
  'bg-[color:var(--color-pink-300)] text-[color:var(--color-ink-base)] ' +
  'font-[family-name:var(--font-display)] text-[length:var(--text-lg)] tracking-[0.04em] ' +
  'py-[var(--gap-sm)] px-[var(--gap-lg)] ' +
  'border-b-[length:2px] border-dashed border-b-[color:var(--color-border-card)]'

const BODY_CLASSES =
  'p-[var(--gap-lg)] font-[family-name:var(--font-body)] text-[color:var(--color-text-primary)]'

export function PixelCard({ children, header, className }: PixelCardProps) {
  return (
    <div className={clsx(ROOT_CLASSES, className)}>
      {header && <div className={HEADER_CLASSES}>{header}</div>}
      <div className={BODY_CLASSES}>{children}</div>
    </div>
  )
}
