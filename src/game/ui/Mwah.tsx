import type { MwahFlag } from '@/game/loop/state'

// "쪽!!" — 뽀뽀 시 두 캐릭터 중점 위로 0.7초간 튀어오르며 페이드아웃.
// key={state.until} → 매 뽀뽀마다 새 until → 재마운트로 mwah-pop 재시작.

export type MwahProps = {
  state: MwahFlag
  now: number
}

export function Mwah({ state, now }: MwahProps) {
  if (!state.active || state.until <= now) return null
  return (
    <div
      key={state.until}
      className="font-display animate-mwah-pop pointer-events-none absolute z-10 font-bold whitespace-nowrap"
      style={{
        left: state.x,
        top: state.y,
        fontSize: 40,
        color: 'var(--color-bg-card)',
        textShadow:
          '4px 4px 0 var(--color-pink-700), -1px -1px 0 var(--color-ink-base), 1px -1px 0 var(--color-ink-base), -1px 1px 0 var(--color-ink-base), 1px 1px 0 var(--color-ink-base)',
      }}
    >
      쪽!!
    </div>
  )
}
