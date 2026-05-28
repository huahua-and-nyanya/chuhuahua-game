import type { ReactNode } from 'react'
import clsx from 'clsx'

type Padding = '0' | 'md' | 'lg'

interface PixelCardProps {
  children: ReactNode
  header?: ReactNode
  className?: string
  padding?: Padding
}

const ROOT_CLASSES =
  'flex flex-col overflow-hidden ' +
  'bg-bg-card ' +
  'border-2 border-dashed border-border-card ' +
  'rounded-md shadow-card'

const HEADER_CLASSES =
  'bg-pink-300 text-ink-base ' +
  'font-display text-lg tracking-[0.04em] ' +
  'py-md px-lg ' +
  'border-b-2 border-dashed border-b-border-card'

const PADDING_CLASSES: Record<Padding, string> = {
  '0': '',
  md: 'p-md',
  lg: 'p-lg',
}

export function PixelCard({
  children,
  header,
  className,
  padding = 'lg',
}: PixelCardProps) {
  return (
    <div className={clsx(ROOT_CLASSES, className)}>
      {header && <div className={HEADER_CLASSES}>{header}</div>}
      <div
        className={clsx(
          'font-body text-text-primary',
          PADDING_CLASSES[padding],
        )}
      >
        {children}
      </div>
    </div>
  )
}
