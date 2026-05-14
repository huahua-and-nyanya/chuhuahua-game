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
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={alt}
    >
      <img src={icon} alt={alt} className={styles.icon} />
    </button>
  )
}
