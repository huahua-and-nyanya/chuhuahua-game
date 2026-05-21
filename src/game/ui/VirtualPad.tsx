import type { Direction } from './virtual-types'

// WASD 원형 4버튼 그룹.
// 컨테이너 132×132 안에 absolute로 4 위치 (top/left/bottom/right center).
// 시각: pink-300 fill + ink-base border + ink-base text. (IconNavButton 패턴과 동일.)
// onPress/onRelease는 부모(VirtualController)가 누적 state로 관리.

const CONTAINER_SIZE = 132
const BUTTON_SIZE = 44

// IconNavButton과 같은 진행 — rounded-full + border + ink-base 평면 그림자 톤.
const BUTTON_CLASSES =
  'absolute inline-flex items-center justify-center select-none ' +
  'rounded-full border-2 border-ink-base ' +
  'bg-pink-300 text-text-primary ' +
  'font-body text-base font-medium ' +
  'shadow-icon-button-rest active:opacity-80'

const POSITIONS: Record<
  string,
  {
    dir: Direction
    top?: number
    left?: number
    bottom?: number
    right?: number
    label: string
  }
> = {
  W: { dir: 'up', top: 0, label: 'W' },
  A: { dir: 'left', left: 0, label: 'A' },
  S: { dir: 'down', bottom: 0, label: 'S' },
  D: { dir: 'right', right: 0, label: 'D' },
}

export type VirtualPadProps = {
  onPress: (dir: Direction) => void
  onRelease: (dir: Direction) => void
}

export function VirtualPad({ onPress, onRelease }: VirtualPadProps) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
    >
      {Object.entries(POSITIONS).map(([key, p]) => {
        // 십자 위치 — 좌상은 axial center로 정렬 (W는 horizontal center, A는 vertical center).
        const positional: Record<string, string | number> = {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
        }
        if (p.top !== undefined) {
          positional.top = p.top
          positional.left = '50%'
          positional.transform = 'translateX(-50%)'
        } else if (p.bottom !== undefined) {
          positional.bottom = p.bottom
          positional.left = '50%'
          positional.transform = 'translateX(-50%)'
        } else if (p.left !== undefined) {
          positional.left = p.left
          positional.top = '50%'
          positional.transform = 'translateY(-50%)'
        } else if (p.right !== undefined) {
          positional.right = p.right
          positional.top = '50%'
          positional.transform = 'translateY(-50%)'
        }
        return (
          <button
            key={key}
            type="button"
            aria-label={p.label}
            className={BUTTON_CLASSES}
            style={{ ...positional, touchAction: 'none', userSelect: 'none' }}
            onTouchStart={(e) => {
              e.preventDefault()
              onPress(p.dir)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              onRelease(p.dir)
            }}
            onTouchCancel={() => onRelease(p.dir)}
            onMouseDown={() => onPress(p.dir)}
            onMouseUp={() => onRelease(p.dir)}
            onMouseLeave={() => onRelease(p.dir)}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
