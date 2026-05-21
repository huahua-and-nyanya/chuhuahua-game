import type { Direction } from './virtual-types'

// 방향키 십자 D-pad.
// 132×132 컨테이너 안에 둥근 모서리 SVG 십자(진한 핑크 fill + ink-base stroke) + 4 방향 버튼 absolute.
// 버튼은 SVG 위에 layer(z-1), 화살표 텍스트 흰색.
// 화살표는 유니코드 트라이앵글(▲▼◀▶) — CLAUDE.md 이모지 금지 정책 안전(dingbat geometric shapes).

const CONTAINER_SIZE = 132
const BUTTON_SIZE = 44

const CROSS_PATH =
  'M 50 2 L 82 2 Q 88 2 88 8 L 88 44 L 124 44 Q 130 44 130 50 L 130 82 ' +
  'Q 130 88 124 88 L 88 88 L 88 124 Q 88 130 82 130 L 50 130 ' +
  'Q 44 130 44 124 L 44 88 L 8 88 Q 2 88 2 82 L 2 50 Q 2 44 8 44 ' +
  'L 44 44 L 44 8 Q 44 2 50 2 Z'

// IconNavButton 패턴과 동일한 border/그림자 토큰. 단 fill은 SVG가 그려서 button 자체는 투명.
const BUTTON_CLASSES =
  'absolute inline-flex items-center justify-center select-none ' +
  'bg-transparent border-none ' +
  'text-text-on-pink font-body text-xl font-bold leading-none ' +
  'active:opacity-80'

type DpadEntry = {
  dir: Direction
  label: string
  top?: number
  left?: number
  bottom?: number
  right?: number
}

const POSITIONS: DpadEntry[] = [
  { dir: 'up', label: '▲', top: 0 },
  { dir: 'left', label: '◀', left: 0 },
  { dir: 'down', label: '▼', bottom: 0 },
  { dir: 'right', label: '▶', right: 0 },
]

export type VirtualDpadProps = {
  onPress: (dir: Direction) => void
  onRelease: (dir: Direction) => void
}

export function VirtualDpad({ onPress, onRelease }: VirtualDpadProps) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
    >
      <svg
        viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
        width={CONTAINER_SIZE}
        height={CONTAINER_SIZE}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <path
          d={CROSS_PATH}
          fill="var(--color-pink-400)"
          stroke="var(--color-ink-base)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>

      {POSITIONS.map((p) => {
        const positional: Record<string, string | number> = {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          zIndex: 1,
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
            key={p.dir}
            type="button"
            aria-label={p.dir}
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
