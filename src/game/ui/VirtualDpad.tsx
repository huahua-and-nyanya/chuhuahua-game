import { dpad } from '@/assets'

import type { Direction } from './virtual-types'

// 방향키 십자 D-pad (모바일).
// 시각: dpad.png 1장이 십자 그래픽 + 화살표 전부 담당.
// hit-test: 투명 버튼 4개를 동일 컨테이너 위(absolute)에 그대로 유지.

const CONTAINER_SIZE = 104
const BUTTON_SIZE = 36

// 투명 hit-test 버튼 — 시각은 PNG, 입력만 받음.
const BUTTON_CLASSES =
  'absolute inline-flex items-center justify-center select-none ' +
  'bg-transparent border-none p-0 ' +
  'active:opacity-80'

type DpadEntry = {
  dir: Direction
  top?: number
  left?: number
  bottom?: number
  right?: number
}

const POSITIONS: DpadEntry[] = [
  { dir: 'up', top: 0 },
  { dir: 'left', left: 0 },
  { dir: 'down', bottom: 0 },
  { dir: 'right', right: 0 },
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
      <img
        src={dpad}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
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
          />
        )
      })}
    </div>
  )
}
