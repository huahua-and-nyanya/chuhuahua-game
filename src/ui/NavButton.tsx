import styles from './NavButton.module.css'

interface NavButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function NavButton({
  label,
  onClick,
  disabled = false,
  className,
}: NavButtonProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.accent} aria-hidden />
      <span className={styles.label}>{label}</span>
    </button>
  )
}
