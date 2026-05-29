import clsx from 'clsx'
import type { ClothEntry } from '@/features/wardrobe/types'
import { GRADE_TOKENS } from '@/features/wardrobe/grades'

interface GridCardProps {
  cloth: ClothEntry
  owned: boolean
  equipped: boolean
  objectSrc?: string
  onClick?: () => void
  className?: string
}

const ROOT_CLASSES =
  'relative aspect-square rounded-xl border-2 border-solid border-ink-base ' +
  'bg-bg-card shadow-icon-button-rest pt-1.5 px-1.5 pb-6 ' +
  'flex flex-col items-center justify-center ' +
  'select-none transition-transform'

const OWNED_CLASSES = 'cursor-pointer'
const UNOWNED_CLASSES = 'opacity-70 cursor-default'

const EQUIPPED_CLASSES = 'ring-2 ring-orange-500 -translate-y-0.5'

const BADGE_CLASSES =
  'absolute top-1 right-1 w-[18px] h-[18px] rounded-full ' +
  'bg-orange-500 border-2 border-solid border-ink-base ' +
  'text-white text-xs leading-none ' +
  'flex items-center justify-center'

const PAIR_SLOT_CLASSES =
  'absolute top-1 left-1 w-3.5 h-3.5 rounded-full ' +
  'bg-ink-base/15 border border-solid border-ink-base/40'

const GRADE_CHIP_BASE =
  'flex items-center justify-center ' +
  'w-9 py-[3px] rounded-full border-[2px] border-solid ' +
  'text-[8px] font-bold leading-none'

const GRADE_CHIP_MUTED = 'bg-stone-100 border-stone-300 text-stone-500'

export function GridCard({
  cloth,
  owned,
  equipped,
  objectSrc,
  onClick,
  className,
}: GridCardProps) {
  const grade = GRADE_TOKENS[cloth.grade]
  const gradeChipClasses = owned
    ? clsx(grade.bg, grade.border, grade.text)
    : GRADE_CHIP_MUTED

  const handleClick = owned ? onClick : undefined

  return (
    <div
      className={clsx(
        ROOT_CLASSES,
        owned ? OWNED_CLASSES : UNOWNED_CLASSES,
        equipped && EQUIPPED_CLASSES,
        className,
      )}
      onClick={handleClick}
      role={owned ? 'button' : undefined}
      tabIndex={owned ? 0 : undefined}
      aria-pressed={owned ? equipped : undefined}
    >
      {cloth.pair && <div aria-hidden="true" className={PAIR_SLOT_CLASSES} />}

      {equipped && (
        <div aria-label="장착됨" className={BADGE_CLASSES}>
          ✓
        </div>
      )}

      {owned && objectSrc ? (
        <img
          src={objectSrc}
          alt=""
          draggable={false}
          className="pointer-events-none h-14 w-14 object-contain"
        />
      ) : (
        <div
          aria-hidden="true"
          className={clsx(
            'flex h-14 w-14 items-center justify-center text-3xl leading-none',
            !owned && 'opacity-60 grayscale',
          )}
        >
          ?
        </div>
      )}
      <div className="absolute bottom-1.5 left-1/2 flex w-fit -translate-x-1/2 flex-row items-center gap-1.5 rounded-full border-[1.5px] border-gray-200 pr-2 whitespace-nowrap">
        <span className={clsx(GRADE_CHIP_BASE, gradeChipClasses)}>
          {cloth.grade}
        </span>
        <div
          className={clsx(
            'text-[10px] leading-tight',
            owned ? 'text-ink-base' : 'text-stone-500',
          )}
        >
          {owned ? cloth.name : '???'}
        </div>
      </div>
    </div>
  )
}
