import {
  FISH_FIRST_DELAY,
  ITEM_RESPAWN_MAX,
  ITEM_RESPAWN_MIN,
  KIBBLE_FIRST_DELAY,
  PIGEON_SPAWN_BASE,
  PIGEON_SPAWN_MIN,
  PIGEON_SPAWN_PER_LEVEL,
} from '@/game/constants'
import { clearAllTrackedTimeouts, trackedTimeout } from '@/hooks/trackedTimeout'

import type { GameRefs } from './state'

export type SoloSpawnKind = 'kibble' | 'fish'

export type SpawnDeps = {
  refs: GameRefs
  getLevel: () => number
  getNow: () => number
  // 실제 비둘기/아이템 생성은 character/item factory에서.
  spawnPigeon: () => void
  spawnItem: (kind: SoloSpawnKind) => void
}

// 옷 효과 곱셈 자리 — 사이클 W에서 옷 효과로 주입한다.
// C 범위에선 1 하드코딩.
const PIGEON_SPAWN_MUL = 1
const ITEM_SPAWN_MUL = 1

// 모듈 스코프 단일 인스턴스 (사이클 C: 동시에 진행되는 게임 하나).
// 멈춤 후 새 게임 시작 시 stale closure가 살아남는 걸 막기 위해 currentDeps !== deps 체크.
let currentDeps: SpawnDeps | null = null

export function startSpawnScheduler(deps: SpawnDeps): void {
  stopSpawnScheduler()
  currentDeps = deps

  // 첫 아이템 1회씩. respawn은 픽업 처리 측(C-3)이 scheduleItemRespawn으로 트리거.
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem('kibble')
  }, KIBBLE_FIRST_DELAY * ITEM_SPAWN_MUL)

  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem('fish')
  }, FISH_FIRST_DELAY * ITEM_SPAWN_MUL)

  schedulePigeonSpawn(deps)
}

export function stopSpawnScheduler(): void {
  clearAllTrackedTimeouts()
  currentDeps = null
}

// 픽업 후 외부에서 호출 — 아이템 1개를 ITEM_RESPAWN_MIN ~ MAX 사이 랜덤 딜레이로 재스폰.
export function scheduleItemRespawn(kind: SoloSpawnKind): void {
  const deps = currentDeps
  if (!deps) return
  const range = ITEM_RESPAWN_MAX - ITEM_RESPAWN_MIN
  const delay = (ITEM_RESPAWN_MIN + Math.random() * range) * ITEM_SPAWN_MUL
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnItem(kind)
  }, delay)
}

function schedulePigeonSpawn(deps: SpawnDeps): void {
  const level = deps.getLevel()
  const base = Math.max(
    PIGEON_SPAWN_MIN,
    PIGEON_SPAWN_BASE - level * PIGEON_SPAWN_PER_LEVEL,
  )
  const delay = base * PIGEON_SPAWN_MUL
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    deps.spawnPigeon()
    schedulePigeonSpawn(deps)
  }, delay)
}
