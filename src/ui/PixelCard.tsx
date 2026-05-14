import type { ReactNode } from 'react'
import styles from './PixelCard.module.css'

interface PixelCardProps {
  children: ReactNode
  header?: ReactNode
  className?: string
}

export function PixelCard({ children, header, className }: PixelCardProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
    </div>
  )
}
