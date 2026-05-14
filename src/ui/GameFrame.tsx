import type { ReactNode } from 'react'
import styles from './GameFrame.module.css'

interface GameFrameProps {
  children: ReactNode
  sideMenu?: ReactNode
  cornerActions?: ReactNode
  background?: string
  className?: string
}

export function GameFrame({
  children,
  sideMenu,
  cornerActions,
  background,
  className,
}: GameFrameProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} style={background ? { background } : undefined}>
      <div className={styles.content}>{children}</div>
      {cornerActions && (
        <div className={styles.cornerActions}>{cornerActions}</div>
      )}
      {sideMenu && <div className={styles.sideMenu}>{sideMenu}</div>}
    </div>
  )
}
