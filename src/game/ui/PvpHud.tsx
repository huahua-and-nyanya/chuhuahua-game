import { IconHeartFilled, IconShield, IconClock } from '@tabler/icons-react'
import clsx from 'clsx'

import { SHIELD_DURATION } from '@/game/constants'
import type { EffectState } from '@/game/state'

// PvP 전용 HUD — 중앙 상단에 ⏱ MM:SS / 💋 N / 10 두 칩.
// 마지막 5초(remainingMs ≤ 5000)는 빨간색 + pulse 애니메이션.
// 활성 효과 게이지(catShield 등)는 우상단(솔로와 동일 위치).
//
// 색상은 모두 토큰 var() 참조 — 하드코딩 금지 정책 준수.

export type PvpHudProps = {
  remainingMs: number
  kissCount: number
  kissGoal: number
  effects: EffectState
  now: number
}

const TIME_DANGER_MS = 5000

function formatMmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const mm = Math.floor(total / 60)
  const ss = total % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

const CHIP_BASE =
  'bg-bg-card border-ink-base text-text-primary gap-xs rounded-pill px-md py-xs flex items-center border-2 text-sm font-medium'

export function PvpHud(props: PvpHudProps) {
  const { remainingMs, kissCount, kissGoal, effects, now } = props
  const isDanger = remainingMs <= TIME_DANGER_MS

  const shieldRemaining = effects.catShield.until - now
  const chiShieldRemaining = effects.chiShield.until - now

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* 중앙 상단 stack — 시간 칩 + 카운트 칩 */}
      <div className="top-md gap-xs absolute left-1/2 flex -translate-x-1/2 flex-col items-center">
        <div
          className={clsx(
            CHIP_BASE,
            isDanger && 'text-danger border-danger animate-pvp-time-pulse',
          )}
        >
          <IconClock
            size={16}
            stroke={2.5}
            className={isDanger ? 'text-danger' : 'text-ink-base'}
          />
          <span className="tabular-nums">{formatMmss(remainingMs)}</span>
        </div>
        <div className={CHIP_BASE}>
          <IconHeartFilled size={16} className="text-pink-700" />
          <span className="tabular-nums">
            {kissCount} / {kissGoal}
          </span>
        </div>
      </div>

      {/* 우상단 — 쉴드 게이지 stack. catShield/chiShield 각각 활성 시 표시. */}
      {(shieldRemaining > 0 || chiShieldRemaining > 0) && (
        <div className="top-md right-md gap-xs absolute flex flex-col items-end">
          {chiShieldRemaining > 0 && (
            <ShieldGauge remaining={chiShieldRemaining} />
          )}
          {shieldRemaining > 0 && <ShieldGauge remaining={shieldRemaining} />}
        </div>
      )}
    </div>
  )
}

function ShieldGauge({ remaining }: { remaining: number }) {
  return (
    <div className="bg-bg-card border-ink-base gap-xs rounded-pill px-sm py-xs flex items-center border-2">
      <IconShield size={16} stroke={2.5} className="text-game-shield-blue" />
      <div className="rounded-pill h-1 w-9 overflow-hidden bg-pink-50">
        <div
          className="rounded-pill bg-game-shield-blue h-full transition-[width] duration-150 ease-linear"
          style={{
            width: `${Math.max(0, Math.min(1, remaining / SHIELD_DURATION)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
