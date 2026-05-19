import type { CSSProperties, ReactNode } from 'react'
import clsx from 'clsx'

interface GameFrameProps {
  children: ReactNode
  sideMenu?: ReactNode
  cornerActions?: ReactNode
  background?: string
  className?: string
}

/* --frame-bg는 props.background 전달용 CSS 변수. 미설정 시 fallback으로 기본 그래디언트 사용 */
const ROOT_CLASSES =
  'relative w-full mx-auto overflow-hidden ' +
  'max-w-frame max-md:max-w-[95vw] ' +
  'aspect-frame rounded-frame ' +
  'border-[length:var(--frame-border-width)] border-solid border-border-frame ' +
  '[background:var(--frame-bg,var(--gradient-frame-bg))] ' +
  'shadow-[inset_0_0_0_var(--frame-inset-width)_var(--color-border-frame-inset)]'

const CONTENT_CLASSES =
  'absolute inset-0 flex items-center justify-center p-frame-inner'

const SIDE_MENU_CLASSES =
  'absolute right-frame-inner bottom-frame-inner ' +
  'flex flex-col gap-nav-button-gap z-[2] max-md:hidden'

const CORNER_ACTIONS_CLASSES =
  'absolute top-frame-inner right-frame-inner ' +
  'flex flex-row gap-sm z-[2] max-md:hidden'

export function GameFrame({
  children,
  sideMenu,
  cornerActions,
  background,
  className,
}: GameFrameProps) {
  return (
    <div
      className={clsx(ROOT_CLASSES, className)}
      style={
        background ? ({ '--frame-bg': background } as CSSProperties) : undefined
      }
    >
      <div className={CONTENT_CLASSES}>{children}</div>
      {cornerActions && (
        <div className={CORNER_ACTIONS_CLASSES}>{cornerActions}</div>
      )}
      {sideMenu && <div className={SIDE_MENU_CLASSES}>{sideMenu}</div>}
    </div>
  )
}
