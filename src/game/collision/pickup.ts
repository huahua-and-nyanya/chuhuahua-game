import { ITEM_PICKUP_DIST } from '@/game/constants'
import {
  applyCucumberEffect,
  applyFishEffect,
  applyKibbleEffect,
  applySweetPotatoEffect,
} from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import type { SoloSpawnKind } from '@/game/loop/spawn'
import type { ItemKind } from '@/game/state'

// reference 1901~2020 솔로 분기 이식. 솔로 단일 (chi만 픽업).
// kibble/fish는 항상 등장, cucumber/sweetPotato는 LV3+ 활성 (spawn.ts).
// PvP picker 분기는 사이클 F.

export type PickupDeps = {
  refs: GameRefs
  now: number
  // 픽업 후 1회 재스폰 트리거 (kibble/fish만). spawn.ts의 scheduleItemRespawn.
  scheduleRespawn: (kind: SoloSpawnKind) => void
  // 점수/콤보/토스트 등은 본 콜백으로 외부에 위임 (C-4').
  onPickup: (kind: ItemKind, by: 'chi') => void
}

export function checkPickups(deps: PickupDeps): void {
  const { refs, now, scheduleRespawn, onPickup } = deps
  const chi = refs.chi

  // 역순 루프 — splice 안전.
  for (let i = refs.items.length - 1; i >= 0; i--) {
    const item = refs.items[i]
    const d = Math.hypot(item.x - chi.x, item.y - chi.y)
    if (d >= ITEM_PICKUP_DIST) continue

    if (item.kind === 'kibble') {
      applyKibbleEffect(refs, now)
    } else if (item.kind === 'fish') {
      applyFishEffect(refs, now, 'chi')
    } else if (item.kind === 'cucumber') {
      applyCucumberEffect(refs, now)
    } else if (item.kind === 'sweetPotato') {
      applySweetPotatoEffect(refs, now, 'chi')
    }

    refs.items.splice(i, 1)
    // 모든 솔로 아이템 재스폰 (디버프는 spawn.ts에서 더 긴 범위로 분기).
    scheduleRespawn(item.kind)
    onPickup(item.kind, 'chi')
  }
}
