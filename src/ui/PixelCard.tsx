import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PixelCardProps {
  children: ReactNode
  header?: ReactNode
  className?: string
}

const ROOT_CLASSES =
  'flex flex-col overflow-hidden ' +
  'bg-bg-card ' +
  'border-2 border-dashed border-border-card ' +
  'rounded-md shadow-card'

const HEADER_CLASSES =
  'bg-pink-300 text-ink-base ' +
  'font-display text-lg tracking-[0.04em] ' +
  'py-sm px-lg ' +
  'border-b-2 border-dashed border-b-border-card'

const BODY_CLASSES = 'p-lg font-body text-text-primary'

export function PixelCard({ children, header, className }: PixelCardProps) {
  return (
    <div className={clsx(ROOT_CLASSES, className)}>
      {header && <div className={HEADER_CLASSES}>{header}</div>}
      <div className={BODY_CLASSES}>{children}</div>
    </div>
  )
}
