import clsx from 'clsx'
import { COIN_ICON_PATH } from '@/assets/clothes'

type Size = 'sm' | 'md'

interface CoinChipProps {
  amount: number
  size?: Size
  floating?: boolean
  className?: string
}

const ROOT_CLASSES =
  'inline-flex items-center gap-1 ' +
  'border-2 border-solid border-border-button rounded-pill ' +
  'font-body font-bold text-ink-base ' +
  'shadow-icon-button-rest ' +
  'whitespace-nowrap select-none'

const SOLID_BG = 'bg-bg-icon-button'
const FLOATING_BG = 'bg-bg-icon-button/85'

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-2.5 py-[3px] text-xs',
  md: 'px-3.5 py-1 text-sm',
}

const ICON_SIZE_CLASSES: Record<Size, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-[18px] h-[18px]',
}

export function CoinChip({
  amount,
  size = 'md',
  floating = false,
  className,
}: CoinChipProps) {
  return (
    <div
      className={clsx(
        ROOT_CLASSES,
        floating ? FLOATING_BG : SOLID_BG,
        SIZE_CLASSES[size],
        className,
      )}
    >
      <img
        src={COIN_ICON_PATH}
        alt=""
        aria-hidden="true"
        className={clsx('block object-contain', ICON_SIZE_CLASSES[size])}
      />
      <span>{amount}</span>
    </div>
  )
}
