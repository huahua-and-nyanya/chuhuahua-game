import type { Direction } from './virtual-types'

// 방향키 십자 D-pad.
// 132×132 컨테이너 안에 둥근 모서리 SVG 십자(진한 핑크 fill + ink-base stroke) + 4 방향 버튼 absolute.
// 버튼은 SVG 위에 layer(z-1), 화살표 텍스트 흰색.
// 화살표는 유니코드 트라이앵글(▲▼◀▶) — CLAUDE.md 이모지 금지 정책 안전(dingbat geometric shapes).

const CONTAINER_SIZE = 104
const BUTTON_SIZE = 36

// 십자 SVG path — 132×132 → 104×104 비율 축소 (132에서 모든 좌표 × 104/132 ≈ × 0.788).
// 단순화 위해 새 좌표로 작성: 외곽 8px 안쪽, 십자 팔 width 36px.
const CROSS_PATH =
  'M 40 2 L 64 2 Q 70 2 70 8 L 70 34 L 96 34 Q 102 34 102 40 L 102 64 ' +
  'Q 102 70 96 70 L 70 70 L 70 96 Q 70 102 64 102 L 40 102 ' +
  'Q 34 102 34 96 L 34 70 L 8 70 Q 2 70 2 64 L 2 40 Q 2 34 8 34 ' +
  'L 34 34 L 34 8 Q 34 2 40 2 Z'

// DS 프레임(pink-500) 위 흰 십자 + pink-300 화살표 — SVG가 흰 fill 그리고 button은 투명.
const BUTTON_CLASSES =
  'absolute inline-flex items-center justify-center select-none ' +
  'bg-transparent border-none ' +
  'text-pink-300 font-body text-xl font-bold leading-none ' +
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
          fill="var(--color-bg-card)"
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
            // touchAction: 'none' CSS가 스크롤/줌 방지를 처리. React onTouch*가 passive라
            // e.preventDefault() 호출 시 콘솔 경고 발생 → 호출 X.
            onTouchStart={() => onPress(p.dir)}
            onTouchEnd={() => onRelease(p.dir)}
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
