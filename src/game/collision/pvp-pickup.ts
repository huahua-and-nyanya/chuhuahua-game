import { ITEM_PICKUP_DIST, SHIELD_DURATION } from '@/game/constants'
import {
  applyCatShield,
  applyChiShield,
  applyCucumberEffect,
  applyKibbleEffect,
  applySweetPotatoEffect,
} from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import { addParticles } from '@/game/particles'
import type { ItemKind, ParticleRef, PickerSide } from '@/game/state'

// 픽업 성공 시 색상 (솔로 pickup.ts와 동일 색감).
const PICKUP_COLORS: Record<ItemKind, string> = {
  kibble: '#f59e0b',
  fish: '#3b82f6',
  cucumber: '#10b981',
  sweetPotato: '#f59e0b',
}

// F-1.9: 쉴드 차단 / 디버프 해제 시 캐릭터 머리 위 floatText.
// FloatText.tsx FLOAT_LIFETIME 800ms 일치, Y 오프셋 20px (effects.ts 패턴 동일).
const SHIELD_FLOAT_LIFETIME = 800
const SHIELD_FLOAT_Y_OFFSET = 20
const SHIELD_FLOAT_COLOR = 'var(--color-game-shield-blue)'

function pushShieldFloat(
  refs: GameRefs,
  now: number,
  text: string,
  x: number,
  y: number,
): void {
  refs.floatTexts.push({
    id: now + Math.random(),
    text,
    x,
    y,
    color: SHIELD_FLOAT_COLOR,
    until: now + SHIELD_FLOAT_LIFETIME,
  })
}

function spawnPickupBurst(
  refs: GameRefs,
  now: number,
  x: number,
  y: number,
  kind: ItemKind,
): void {
  const color = PICKUP_COLORS[kind]
  const burst: ParticleRef[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const speed = 2 + Math.random() * 2
    burst.push({
      id: now + i + Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      vr: (Math.random() - 0.5) * 12,
      rot: Math.random() * 360,
      size: 10 + Math.random() * 4,
      life: 16 + Math.random() * 6,
      color,
    })
  }
  addParticles(refs.particles, burst)
}

// reference 1911~2029 PvP 픽업 분기 이식.
//   kibble       → chi만 픽업
//   cucumber     → cat만 픽업
//   fish, sweetPotato → 둘 다 픽업 가능 (chi/cat 중 더 가까운 쪽이 픽업)
//
// 효과 적용:
//   kibble       → applyKibbleEffect (chi)
//   cucumber     → applyCucumberEffect (catSpeedup 부여 → cat 빨라짐, 츄 입장에선 디버프)
//   fish (cat)   → applyCatShield (catShield 5초)
//   fish (chi)   → applyChiShield (chiShield 5초, reference 1521~1529)
//   sweetPotato  → applySweetPotatoEffect(picker) — 픽업 측 슬로우 부여 (부스트와 상쇄)
//                  단, picker='chi'면 chiShield 활성 시 슬로우 차단 + 쉴드 1회 소진 (reference 1992~2014)
//
// scheduleRespawn: pvp-spawn.schedulePvpItemRespawn — 픽업 후 1회 재스폰 예약.
// onPickup: 토스트/플로트 텍스트는 라우트에서 처리.
export type PvpPickupDeps = {
  refs: GameRefs
  now: number
  scheduleRespawn: (kind: ItemKind) => void
  onPickup: (kind: ItemKind, by: PickerSide, cancelled?: boolean) => void
}

function canPickBy(kind: ItemKind, side: PickerSide): boolean {
  if (kind === 'kibble') return side === 'chi'
  if (kind === 'cucumber') return side === 'cat'
  return true
}

export function checkPvpPickups(deps: PvpPickupDeps): void {
  const { refs, now, scheduleRespawn, onPickup } = deps
  const chi = refs.chi
  const cat = refs.cat

  for (let i = refs.items.length - 1; i >= 0; i--) {
    const item = refs.items[i]

    const canChi = canPickBy(item.kind, 'chi')
    const canCat = canPickBy(item.kind, 'cat')
    const dChi = canChi ? Math.hypot(item.x - chi.x, item.y - chi.y) : Infinity
    const dCat = canCat ? Math.hypot(item.x - cat.x, item.y - cat.y) : Infinity
    const d = Math.min(dChi, dCat)
    if (d >= ITEM_PICKUP_DIST) continue

    const pickedBy: PickerSide = dChi <= dCat ? 'chi' : 'cat'

    let cancelled = false
    if (item.kind === 'kibble') {
      cancelled = applyKibbleEffect(refs, now)
    } else if (item.kind === 'fish') {
      if (pickedBy === 'cat') {
        // F-1.9 (reference 1511~1519): catSlow 활성 시 디버프 해제 (쉴드 미부여).
        if (refs.effects.catSlow.until > now) {
          refs.effects.catSlow = { until: 0 }
          pushShieldFloat(
            refs,
            now,
            '해제!',
            refs.cat.x,
            refs.cat.y - SHIELD_FLOAT_Y_OFFSET,
          )
          cancelled = true
        } else {
          applyCatShield(refs, now, SHIELD_DURATION)
        }
      } else {
        applyChiShield(refs, now, SHIELD_DURATION)
      }
    } else if (item.kind === 'cucumber') {
      cancelled = applyCucumberEffect(refs, now)
    } else if (item.kind === 'sweetPotato') {
      // 픽업 측 쉴드 활성 시 디버프 1회 차단 (쉴드 소진).
      // reference 1992~2014: shieldBlocks 체크 → 슬로우 미부여.
      // chi/cat 양쪽 모두 "막음!" 파란 floatText 표시 (F-1.10에서 chi 측에도 대칭 추가).
      if (pickedBy === 'chi' && refs.effects.chiShield.until > now) {
        refs.effects.chiShield = { until: 0 }
        pushShieldFloat(
          refs,
          now,
          '막음!',
          refs.chi.x,
          refs.chi.y - SHIELD_FLOAT_Y_OFFSET,
        )
        cancelled = true
      } else if (pickedBy === 'cat' && refs.effects.catShield.until > now) {
        refs.effects.catShield = { until: 0 }
        pushShieldFloat(
          refs,
          now,
          '막음!',
          refs.cat.x,
          refs.cat.y - SHIELD_FLOAT_Y_OFFSET,
        )
        cancelled = true
      } else {
        cancelled = applySweetPotatoEffect(refs, now, pickedBy)
      }
    }

    if (!cancelled) {
      spawnPickupBurst(refs, now, item.x, item.y, item.kind)
    }

    refs.items.splice(i, 1)
    scheduleRespawn(item.kind)
    onPickup(item.kind, pickedBy, cancelled)
  }
}
