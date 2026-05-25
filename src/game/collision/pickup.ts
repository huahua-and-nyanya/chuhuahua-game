import { ITEM_PICKUP_DIST } from '@/game/constants'
import {
  applyCucumberEffect,
  applyFishEffect,
  applyKibbleEffect,
  applySweetPotatoEffect,
} from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import type { SoloSpawnKind } from '@/game/loop/spawn'
import { addParticles } from '@/game/particles'
import type { ItemKind, ParticleRef } from '@/game/state'

// 픽업 성공 시 작은 글로우 폭발 — 아이템 종류별 색상. 6개 방사형. 상쇄 시엔 안 발동.
// 결정 옵션 3: cucumber=초록, sweetPotato=주황 (item 시각과 매칭).
const PICKUP_COLORS: Record<ItemKind, string> = {
  kibble: '#f59e0b',
  fish: '#3b82f6',
  cucumber: '#10b981',
  sweetPotato: '#f59e0b',
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

// reference 1901~2020 솔로 분기 이식. 솔로 단일 (chi만 픽업).
// kibble/fish는 항상 등장, cucumber/sweetPotato는 LV3+ 활성 (spawn.ts).
// PvP picker 분기는 사이클 F.

export type PickupDeps = {
  refs: GameRefs
  now: number
  // 픽업 후 1회 재스폰 트리거 (kibble/fish만). spawn.ts의 scheduleItemRespawn.
  scheduleRespawn: (kind: SoloSpawnKind) => void
  // 점수/콤보/토스트 등은 본 콜백으로 외부에 위임 (C-4').
  // cancelled=true면 kibble↔sweetPotato 상호 상쇄 발생 — 부스트/슬로우 효과 X.
  onPickup: (kind: ItemKind, by: 'chi', cancelled?: boolean) => void
}

export function checkPickups(deps: PickupDeps): void {
  const { refs, now, scheduleRespawn, onPickup } = deps
  const chi = refs.chi

  // 역순 루프 — splice 안전.
  for (let i = refs.items.length - 1; i >= 0; i--) {
    const item = refs.items[i]
    const d = Math.hypot(item.x - chi.x, item.y - chi.y)
    if (d >= ITEM_PICKUP_DIST) continue

    let cancelled = false
    if (item.kind === 'kibble') {
      cancelled = applyKibbleEffect(refs, now)
    } else if (item.kind === 'fish') {
      applyFishEffect(refs, now, 'chi')
    } else if (item.kind === 'cucumber') {
      cancelled = applyCucumberEffect(refs, now)
    } else if (item.kind === 'sweetPotato') {
      cancelled = applySweetPotatoEffect(refs, now, 'chi')
    }

    // 상쇄 시엔 글로우 안 발동 — 효과 미적용을 시각적으로 구분.
    if (!cancelled) {
      spawnPickupBurst(refs, now, item.x, item.y, item.kind)
    }

    refs.items.splice(i, 1)
    // 모든 솔로 아이템 재스폰 (디버프는 spawn.ts에서 더 긴 범위로 분기).
    scheduleRespawn(item.kind)
    onPickup(item.kind, 'chi', cancelled)
  }
}
