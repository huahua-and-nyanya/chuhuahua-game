import { motion } from 'framer-motion'
import clsx from 'clsx'

interface IconNavButtonProps {
  icon: string
  alt: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

const ROOT_CLASSES =
  'inline-flex items-center justify-center cursor-pointer shrink-0 p-0 ' +
  'w-icon-button h-icon-button ' +
  'bg-bg-icon-button ' +
  'border-[length:var(--icon-button-border-width)] border-solid border-border-icon-button ' +
  'rounded-full shadow-icon-button-rest ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const ICON_CLASSES =
  'w-icon-content h-icon-content ' +
  'object-contain pointer-events-none [image-rendering:pixelated]'

export function IconNavButton({
  icon,
  alt,
  onClick,
  disabled = false,
  className,
}: IconNavButtonProps) {
  return (
    <motion.button
      type="button"
      className={clsx(ROOT_CLASSES, className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={alt}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <img src={icon} alt={alt} className={ICON_CLASSES} />
    </motion.button>
  )
}
