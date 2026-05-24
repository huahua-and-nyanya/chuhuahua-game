import type { FloatTextRef } from '@/game/state'

// 좌표 (x, y) 위로 떠오르며 페이드아웃. 잔여 시간 비율로 opacity + translateY 계산.
// 만료 splice는 expireTransients(C-5')가 `until <= now` 비교로 처리.
// 본 컴포넌트는 받은 시점의 상태를 그대로 표시.

const FLOAT_LIFETIME = 800 // ms, 떠오르는 지속시간 기준 (라우트가 until = now + 800으로 push)
const RISE_DISTANCE = 32 // px, 페이드아웃 동안 위로 올라가는 거리

export type FloatTextsProps = {
  items: FloatTextRef[]
  now: number
}

export function FloatTexts({ items, now }: FloatTextsProps) {
  if (items.length === 0) return null
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((it) => {
        const remaining = it.until - now
        if (remaining <= 0) return null
        const t = Math.max(0, Math.min(1, remaining / FLOAT_LIFETIME))
        const rise = (1 - t) * RISE_DISTANCE
        return (
          <span
            key={it.id}
            className="font-display absolute text-base leading-none"
            style={{
              left: `${it.x}px`,
              top: `${it.y - rise}px`,
              color: it.color,
              opacity: t,
              transform: 'translate(-50%, -50%)',
              textShadow: '0 0 4px var(--color-ink-base)',
            }}
          >
            {it.text}
          </span>
        )
      })}
    </div>
  )
}
