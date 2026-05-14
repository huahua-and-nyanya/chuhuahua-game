import { motion } from 'framer-motion'
import styles from './IconNavButton.module.css'

interface IconNavButtonProps {
  icon: string
  alt: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function IconNavButton({
  icon,
  alt,
  onClick,
  disabled = false,
  className,
}: IconNavButtonProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <motion.button
      type="button"
      className={rootClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={alt}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <img src={icon} alt={alt} className={styles.icon} />
    </motion.button>
  )
}
