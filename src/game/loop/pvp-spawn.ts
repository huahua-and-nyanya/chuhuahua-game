import {
  PVP_CUCUMBER_RESPAWN_MAX,
  PVP_CUCUMBER_RESPAWN_MIN,
  PVP_DEBUFF_FIRST_DELAY,
  PVP_DEBUFF_FIRST_STAGGER,
  PVP_DEBUFF_RESPAWN_MAX,
  PVP_DEBUFF_RESPAWN_MIN,
  PVP_FISH_FIRST_DELAY,
  PVP_ITEM_RESPAWN_MAX,
  PVP_ITEM_RESPAWN_MIN,
  PVP_KIBBLE_FIRST_DELAY,
  PVP_KIBBLE_RESPAWN_MAX,
  PVP_KIBBLE_RESPAWN_MIN,
} from '@/game/constants'
import type { ItemKind } from '@/game/state'
import { clearAllTrackedTimeouts, trackedTimeout } from '@/hooks/trackedTimeout'

import type { GameRefs } from './state'

// PvP에서 스폰 가능한 아이템 — 솔로와 동일 4종 (kibble/fish/cucumber/sweetPotato).
// 비둘기는 PvP에서 스폰하지 않는다 (reference 1304, 1467 분기).
export type PvpSpawnKind = ItemKind

export type PvpSpawnDeps = {
  refs: GameRefs
  getNow: () => number
  spawnItem: (kind: PvpSpawnKind) => void
}

// 모듈 스코프 단일 인스턴스 (solo/loop/spawn.ts와 동일 패턴).
let currentDeps: PvpSpawnDeps | null = null

// reference 1290~1306 startGame 분기 그대로 — 4종 첫 등장 타이밍.
//   kibble = +1000ms / fish = +2500ms / cucumber = +5000ms / sweetPotato = +9000ms.
export function startPvpSpawnScheduler(deps: PvpSpawnDeps): void {
  stopPvpSpawnScheduler()
  currentDeps = deps

  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem('kibble')
  }, PVP_KIBBLE_FIRST_DELAY)

  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem('fish')
  }, PVP_FISH_FIRST_DELAY)

  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem('cucumber')
  }, PVP_DEBUFF_FIRST_DELAY)

  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem('sweetPotato')
  }, PVP_DEBUFF_FIRST_DELAY + PVP_DEBUFF_FIRST_STAGGER)
}

export function stopPvpSpawnScheduler(): void {
  clearAllTrackedTimeouts()
  currentDeps = null
}

// reference 1475~1494 4종 헬퍼 — 픽업 후 외부에서 호출 (pvp-pickup.ts 등).
//   kibble  → PVP_KIBBLE_RESPAWN_MIN..MAX (츄 유리, 더 자주)
//   fish    → PVP_ITEM_RESPAWN_MIN..MAX (일반)
//   cucumber→ PVP_CUCUMBER_RESPAWN_MIN..MAX (츄 불리, 덜 자주)
//   sweetPotato → PVP_DEBUFF_RESPAWN_MIN..MAX (일반 디버프)
function rangeFor(kind: PvpSpawnKind): { min: number; max: number } {
  if (kind === 'kibble') {
    return { min: PVP_KIBBLE_RESPAWN_MIN, max: PVP_KIBBLE_RESPAWN_MAX }
  }
  if (kind === 'fish') {
    return { min: PVP_ITEM_RESPAWN_MIN, max: PVP_ITEM_RESPAWN_MAX }
  }
  if (kind === 'cucumber') {
    return { min: PVP_CUCUMBER_RESPAWN_MIN, max: PVP_CUCUMBER_RESPAWN_MAX }
  }
  return { min: PVP_DEBUFF_RESPAWN_MIN, max: PVP_DEBUFF_RESPAWN_MAX }
}

export function schedulePvpItemRespawn(kind: PvpSpawnKind): void {
  const deps = currentDeps
  if (!deps) return
  const { min, max } = rangeFor(kind)
  const delay = min + Math.random() * (max - min)
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem(kind)
  }, delay)
}
