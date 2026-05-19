import clsx from 'clsx'

interface NavButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

const ROOT_CLASSES =
  'inline-flex items-center gap-[var(--gap-sm)] cursor-pointer select-none whitespace-nowrap ' +
  'h-[var(--nav-button-height)] w-[var(--nav-button-width)] ' +
  'px-[var(--gap-md)] max-md:px-[var(--gap-sm)] ' +
  'bg-[color:var(--color-tab-default)] text-[color:var(--color-tab-text)] ' +
  'border-[length:3px] border-solid border-[color:var(--color-ink-base)] ' +
  'rounded-[var(--radius-pill)] shadow-[var(--shadow-nav-rest)] ' +
  'font-[family-name:var(--font-body)] font-bold ' +
  'text-[length:var(--text-sm)] max-md:text-[length:var(--text-xs)] ' +
  'transition-[transform,box-shadow,background-color] duration-[var(--transition-fast)] ' +
  'hover:enabled:bg-[color:var(--color-tab-hover)] hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-[var(--shadow-nav-hover)] ' +
  'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-[var(--shadow-button-pressed)] ' +
  'disabled:bg-[color:var(--color-tab-disabled)] disabled:cursor-not-allowed disabled:opacity-70'

const ACCENT_CLASSES =
  'inline-block w-[8px] h-[8px] rounded-[var(--radius-circle)] bg-[color:var(--color-text-on-pink)] shrink-0'

const LABEL_CLASSES = 'flex-1 text-center'

export function NavButton({
  label,
  onClick,
  disabled = false,
  className,
}: NavButtonProps) {
  return (
    <button
      type="button"
      className={clsx(ROOT_CLASSES, className)}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={ACCENT_CLASSES} aria-hidden />
      <span className={LABEL_CLASSES}>{label}</span>
    </button>
  )
}
