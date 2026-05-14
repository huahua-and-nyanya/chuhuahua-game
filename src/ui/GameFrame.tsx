import type { ReactNode } from 'react'
import styles from './GameFrame.module.css'

interface GameFrameProps {
  children: ReactNode
  bottomMenu?: ReactNode
  cornerActions?: ReactNode
  className?: string
}

export function GameFrame({
  children,
  bottomMenu,
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
      {bottomMenu && <div className={styles.bottomMenu}>{bottomMenu}</div>}
    </div>
  )
}
