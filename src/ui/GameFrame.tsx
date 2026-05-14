import type { ReactNode } from 'react'
import styles from './GameFrame.module.css'

interface GameFrameProps {
  children: ReactNode
  sideMenu?: ReactNode
  cornerActions?: ReactNode
  className?: string
}

export function GameFrame({
  children,
  sideMenu,
  cornerActions,
  className,
}: GameFrameProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <div className={styles.content}>{children}</div>
      {cornerActions && (
        <div className={styles.cornerActions}>{cornerActions}</div>
      )}
      {sideMenu && <div className={styles.sideMenu}>{sideMenu}</div>}
    </div>
  )
}
