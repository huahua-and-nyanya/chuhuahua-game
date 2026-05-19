import clsx from 'clsx'
import { CoinChip } from './CoinChip'

type Size = 'sm' | 'md'

interface IconCostButtonProps {
  iconSrc: string
  iconAlt?: string
  label: string
  cost: number
  disabled?: boolean
  onClick?: () => void
  size?: Size
  className?: string
}

const ROOT_CLASSES =
  'inline-flex items-center gap-2 ' +
  'rounded-xl border-2 border-solid border-ink-base bg-bg-icon-button ' +
  'shadow-[2px_2px_0_var(--color-ink-base)] ' +
  'select-none transition-transform ' +
  'hover:enabled:-translate-y-0.5 ' +
  'active:enabled:translate-y-0 active:enabled:shadow-[1px_1px_0_var(--color-ink-base)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-2.5 py-1.5',
  md: 'px-3 py-2',
}

const ICON_SIZE_CLASSES: Record<Size, string> = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
}

const LABEL_SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
}

export function IconCostButton({
  iconSrc,
  iconAlt = '',
  label,
  cost,
  disabled = false,
  onClick,
  size = 'md',
  className,
}: IconCostButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        ROOT_CLASSES,
        SIZE_CLASSES[size],
        'cursor-pointer',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <img
        src={iconSrc}
        alt={iconAlt}
        aria-hidden={iconAlt === '' ? 'true' : undefined}
        className={clsx(
          'pointer-events-none block object-contain',
          ICON_SIZE_CLASSES[size],
        )}
      />
      <span
        className={clsx(
          'font-body text-ink-base font-bold',
          LABEL_SIZE_CLASSES[size],
        )}
      >
        {label}
      </span>
      <CoinChip amount={cost} size={size} />
    </button>
  )
}
