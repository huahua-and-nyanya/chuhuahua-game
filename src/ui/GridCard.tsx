import clsx from 'clsx'
import type { ClothEntry } from '@/features/wardrobe/clothes'
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
  'relative aspect-square rounded-xl border-2 border-solid p-1.5 ' +
  'flex flex-col items-center justify-center gap-1 ' +
  'select-none transition-transform'

const UNOWNED_CLASSES =
  'bg-stone-200 border-stone-400 opacity-70 cursor-default'

const EQUIPPED_CLASSES = 'ring-2 ring-orange-500 -translate-y-0.5'

const BADGE_CLASSES =
  'absolute top-1 right-1 w-[18px] h-[18px] rounded-full ' +
  'bg-orange-500 border-2 border-solid border-ink-base ' +
  'text-white text-xs leading-none ' +
  'flex items-center justify-center'

const PAIR_SLOT_CLASSES =
  'absolute top-1 left-1 w-3.5 h-3.5 rounded-full ' +
  'bg-ink-base/15 border border-solid border-ink-base/40'

export function GridCard({
  cloth,
  owned,
  equipped,
  objectSrc,
  onClick,
  className,
}: GridCardProps) {
  const grade = GRADE_TOKENS[cloth.grade]
  const ownedClasses = clsx(grade.bg, grade.border, 'cursor-pointer')

  const handleClick = owned ? onClick : undefined

  return (
    <div
      className={clsx(
        ROOT_CLASSES,
        owned ? ownedClasses : UNOWNED_CLASSES,
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

      <div
        className={clsx(
          'text-[10px] leading-none font-bold',
          owned ? grade.text : 'text-stone-500',
        )}
      >
        {cloth.grade}
      </div>

      {owned && objectSrc ? (
        <img
          src={objectSrc}
          alt=""
          draggable={false}
          className="pointer-events-none h-10 w-10 object-contain"
        />
      ) : (
        <div
          aria-hidden="true"
          className={clsx(
            'flex h-10 w-10 items-center justify-center text-2xl leading-none',
            !owned && 'opacity-60 grayscale',
          )}
        >
          ?
        </div>
      )}

      <div
        className={clsx(
          'text-center text-[10px] leading-tight',
          owned ? 'text-ink-base' : 'text-stone-500',
        )}
      >
        {owned ? cloth.name : '???'}
      </div>
    </div>
  )
}
