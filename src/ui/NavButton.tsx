import clsx from 'clsx'

interface NavButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

const ROOT_CLASSES =
  'inline-flex items-center gap-sm cursor-pointer select-none whitespace-nowrap ' +
  'h-nav-button-h w-nav-button-w ' +
  'px-md max-md:px-sm ' +
  'bg-tab-default text-tab-text ' +
  'border-[3px] border-solid border-ink-base ' +
  'rounded-pill shadow-nav-rest ' +
  'font-body font-bold ' +
  'text-sm max-md:text-xs ' +
  'transition-[transform,box-shadow,background-color] duration-[var(--transition-fast)] ' +
  'hover:enabled:bg-tab-hover hover:enabled:translate-x-[-1px] hover:enabled:translate-y-[-1px] hover:enabled:shadow-nav-hover ' +
  'active:enabled:translate-x-[1px] active:enabled:translate-y-[1px] active:enabled:shadow-button-pressed ' +
  'disabled:bg-tab-disabled disabled:cursor-not-allowed disabled:opacity-70'

const ACCENT_CLASSES =
  'inline-block w-2 h-2 rounded-full bg-text-on-pink shrink-0'

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
