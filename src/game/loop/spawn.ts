import {
  DEBUFF_RESPAWN_MAX,
  DEBUFF_RESPAWN_MIN,
  FISH_FIRST_DELAY,
  ITEM_RESPAWN_MAX,
  ITEM_RESPAWN_MIN,
  KIBBLE_FIRST_DELAY,
  PIGEON_WAVE_BASE_DELAY,
  PIGEON_WAVE_DELAY_JITTER,
  PIGEON_WAVE_DELAY_PER_LEVEL,
  PIGEON_WAVE_MAX_SIZE,
  PIGEON_WAVE_MEMBER_SPACING,
  PIGEON_WAVE_MIN_DELAY,
} from '@/game/constants'
import { clearAllTrackedTimeouts, trackedTimeout } from '@/hooks/trackedTimeout'

import type { GameRefs } from './state'
import type { PigeonEdge } from '@/game/state'

// 솔로 스폰 가능 아이템 — 부스트(kibble)/쉴드(fish) + LV3+ 디버프(cucumber/sweetPotato)
// + wedding(S+) 게임변형 풀(weddingRing/Invitation/Bouquet).
export type SoloSpawnKind =
  | 'kibble'
  | 'fish'
  | 'cucumber'
  | 'sweetPotato'
  | 'weddingRing'
  | 'weddingInvitation'
  | 'weddingBouquet'

const DEBUFF_KINDS: ReadonlySet<SoloSpawnKind> = new Set([
  'cucumber',
  'sweetPotato',
])

// wedding 게임변형 풀 — 일반 아이템 대신 등장. 재스폰은 고정 간격(레벨 factor 미적용).
const WEDDING_KINDS: ReadonlySet<SoloSpawnKind> = new Set([
  'weddingRing',
  'weddingInvitation',
  'weddingBouquet',
])

export type SpawnDeps = {
  refs: GameRefs
  getLevel: () => number
  getNow: () => number
  // 실제 비둘기/아이템 생성은 character/item factory에서.
  // F-1.8 wave 시스템: edge를 지정해 호출해 wave 안 멤버끼리 가장자리 분산.
  spawnPigeon: (edge?: PigeonEdge) => void
  spawnItem: (kind: SoloSpawnKind) => void
  // wave 사이즈 ≥ 2 시 우상단 토스트 표시 — 옵셔널 (PvP는 비둘기 미스폰이라 미사용).
  showToast?: (text: string, color: string) => void
  // 옷 효과 곱셈 배율 getter (사이클 W). 미지정 시 1.
  // pigeonSpawnMul: 비둘기 wave 간격 × 배율 (클수록 비둘기 적게 등장).
  // itemSpawnMul: 아이템 첫/재스폰 간격 × 배율 (작을수록 아이템 자주 등장).
  getPigeonSpawnMul?: () => number
  getItemSpawnMul?: () => number
  // 사이클 W (wedding S+ 게임변형):
  // pigeonDisabled: true 시 비둘기 wave 예약 자체를 중단.
  // weddingItemMode: true 시 일반 아이템(kibble/fish/디버프) 대신 웨딩 3종을 등장.
  getPigeonDisabled?: () => boolean
  getWeddingItemMode?: () => boolean
}

// 모듈 스코프 단일 인스턴스 (사이클 C: 동시에 진행되는 게임 하나).
// 멈춤 후 새 게임 시작 시 stale closure가 살아남는 걸 막기 위해 currentDeps !== deps 체크.
let currentDeps: SpawnDeps | null = null

export function startSpawnScheduler(deps: SpawnDeps): void {
  stopSpawnScheduler()
  currentDeps = deps

  // 첫 아이템 1회씩. respawn은 픽업 처리 측(C-3)이 scheduleItemRespawn으로 트리거.
  const itemMul = deps.getItemSpawnMul?.() ?? 1

  if (deps.getWeddingItemMode?.()) {
    // wedding 모드 — 일반 아이템 대신 웨딩 3종 첫 등장. 첫 딜레이는 기존 상수 재사용.
    const weddingFirst: ReadonlyArray<[SoloSpawnKind, number]> = [
      ['weddingRing', KIBBLE_FIRST_DELAY],
      ['weddingInvitation', FISH_FIRST_DELAY],
      ['weddingBouquet', KIBBLE_FIRST_DELAY],
    ]
    for (const [kind, delay] of weddingFirst) {
      trackedTimeout(() => {
        if (currentDeps !== deps) return
        if (!canSpawnItem(deps.refs, kind)) return
        deps.spawnItem(kind)
      }, delay * itemMul)
    }
  } else {
    trackedTimeout(() => {
      if (currentDeps !== deps) return
      if (!canSpawnItem(deps.refs, 'kibble')) return
      deps.spawnItem('kibble')
    }, KIBBLE_FIRST_DELAY * itemMul)

    trackedTimeout(() => {
      if (currentDeps !== deps) return
      if (!canSpawnItem(deps.refs, 'fish')) return
      deps.spawnItem('fish')
    }, FISH_FIRST_DELAY * itemMul)
  }

  schedulePigeonWave(deps)
}

export function stopSpawnScheduler(): void {
  // 비둘기 경고 마커(F-1.7) 정리 — 1300ms 후 마커 제거 콜백이 trackedTimeout에 묶여있어
  // clearAllTrackedTimeouts 호출 시 함께 취소된다. 그 결과 refs.warnings에 잔여가 남으므로
  // 스케줄러 정지 시 직접 비운다 (일시정지/게임오버 후 잔여 마커 방지).
  if (currentDeps !== null) {
    currentDeps.refs.warnings = []
  }
  clearAllTrackedTimeouts()
  currentDeps = null
}

// LV3 도달 시 외부(solo.tsx onLevelUp)에서 호출 — 디버프 아이템 첫 등장 예약.
// reference 985~988: cucumber = +8s, sweetPotato = +20s (8 + 12 stagger).
// 픽업 처리는 scheduleItemRespawn으로 재등장 연쇄.
export function scheduleDebuffFirstSpawn(
  kind: 'cucumber' | 'sweetPotato',
  delay: number,
): void {
  const deps = currentDeps
  if (!deps) return
  const itemMul = deps.getItemSpawnMul?.() ?? 1
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    if (!canSpawnItem(deps.refs, kind)) return
    deps.spawnItem(kind)
  }, delay * itemMul)
}

// 픽업 후 외부에서 호출 — 아이템 1개를 재스폰. kind/level에 따라 분기:
//   도움(kibble/fish): 레벨↑ → 쿨다운↓ (LV0 1.0배, LV10 0.4배). 도움이 더 자주.
//   디버프(cucumber/sweetPotato): 레벨↑ → 쿨다운↓ (LV3 1.0배, LV10 0.3배). 함정 더 자주.
// 레벨은 currentDeps.getLevel()에서 매 호출 시 최신 값을 읽음.
// cap: 같은 종류 3개 이상 필드 잔존 시 이번 사이클 스킵 (체인 끊김 — 다음 픽업이 새 체인 시작).
const AID_FACTOR_PER_LEVEL = 0.06
const AID_FACTOR_MIN = 0.4
const DEBUFF_FACTOR_PER_LEVEL = 0.12
const DEBUFF_FACTOR_MIN = 0.3
// fish(실드) 전용 — 같은 도움템이지만 후반엔 귀해지게 재스폰 간격을 늘린다.
// 솔로 실드는 비둘기 1회 무효라(무적 아님), 후반에 자주 나오면 게임이 안 끝나는 문제가 있었음.
// LV0 1.0배 → LV10 2.0배(재스폰 2배 느림). kibble은 기존 AID factor 그대로 유지.
const FISH_FACTOR_PER_LEVEL = 0.1
const FISH_FACTOR_MAX = 2.0
const ITEM_FIELD_CAP = 3 // 같은 종류 동시 상한
const ITEM_TOTAL_CAP = 5 // 필드 전체 동시 상한

// 모든 스폰 경로 공용 — 전체 상한과 종류별 상한을 함께 검사.
function canSpawnItem(refs: GameRefs, kind: SoloSpawnKind): boolean {
  if (refs.items.length >= ITEM_TOTAL_CAP) return false
  let n = 0
  for (const it of refs.items) {
    if (it.kind === kind) n++
  }
  return n < ITEM_FIELD_CAP
}

export function scheduleItemRespawn(kind: SoloSpawnKind): void {
  const deps = currentDeps
  if (!deps) return
  const level = deps.getLevel()
  const isDebuff = DEBUFF_KINDS.has(kind)
  let min: number
  let max: number
  if (WEDDING_KINDS.has(kind)) {
    // 웨딩 3종 — 고정 간격(레벨 factor 미적용). 기존 일반 아이템 기본 범위 재사용.
    min = ITEM_RESPAWN_MIN
    max = ITEM_RESPAWN_MAX
  } else if (isDebuff) {
    const factor = Math.max(
      DEBUFF_FACTOR_MIN,
      1 - Math.max(0, level - 3) * DEBUFF_FACTOR_PER_LEVEL,
    )
    min = DEBUFF_RESPAWN_MIN * factor
    max = DEBUFF_RESPAWN_MAX * factor
  } else if (kind === 'fish') {
    // 후반엔 느려짐 = 실드 귀해짐.
    const factor = Math.min(FISH_FACTOR_MAX, 1 + level * FISH_FACTOR_PER_LEVEL)
    min = ITEM_RESPAWN_MIN * factor
    max = ITEM_RESPAWN_MAX * factor
  } else {
    // kibble — 후반엔 더 자주(기존 도움 factor).
    const factor = Math.max(AID_FACTOR_MIN, 1 - level * AID_FACTOR_PER_LEVEL)
    min = ITEM_RESPAWN_MIN * factor
    max = ITEM_RESPAWN_MAX * factor
  }
  const itemMul = deps.getItemSpawnMul?.() ?? 1
  const delay = (min + Math.random() * (max - min)) * itemMul
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    if (!canSpawnItem(deps.refs, kind)) return
    deps.spawnItem(kind)
  }, delay)
}

// === 비둘기 wave 시스템 (F-1.8) — reference line 1111~1151 ===
// 매 wave마다 waveSize(1~3)를 레벨 확률로 뽑아 600ms 간격으로 비둘기 N마리를 같은 wave로 등장시킨다.
// 비둘기 실제 push는 deps.spawnPigeon(edge)이 책임 (F-1.7 경고 마커 1300ms → 실제 스폰 파이프라인).
// edges 셔플 후 i % 4로 선택하므로 같은 wave 안 첫 4마리는 서로 다른 가장자리 보장.
const WAVE_EDGES: PigeonEdge[] = ['top', 'left', 'right', 'bottom']

// waveSize = 레벨을 상한으로, 하한~상한 사이 랜덤. 매 wave 변주를 위함.
//   상한 = min(level, MAX), 하한 = ceil(상한/2). LV0~1은 최소 1 보장.
//   하한을 cap 적용된 maxSize 기준으로 계산 → LV11+ 구간도 5~10 유지.
//   예) LV6 → 3~6, LV10 → 5~10, LV2 → 1~2, LV1 → 1.
function pickWaveSize(level: number): number {
  const maxSize = Math.min(level, PIGEON_WAVE_MAX_SIZE)
  const minSize = Math.max(1, Math.ceil(maxSize / 2))
  return minSize + Math.floor(Math.random() * (maxSize - minSize + 1))
}

// in-place Fisher-Yates 셔플 — 짧은 4-요소 배열에 충분.
function shuffleEdges(arr: PigeonEdge[]): PigeonEdge[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function schedulePigeonWave(deps: SpawnDeps): void {
  // wedding 등 pigeonDisabled 게임변형 — wave 예약 자체를 건너뛴다(재귀 예약도 중단).
  if (deps.getPigeonDisabled?.()) return
  const level = deps.getLevel()
  const baseDelay = Math.max(
    PIGEON_WAVE_MIN_DELAY,
    PIGEON_WAVE_BASE_DELAY - level * PIGEON_WAVE_DELAY_PER_LEVEL,
  )
  const pigeonMul = deps.getPigeonSpawnMul?.() ?? 1
  const delay =
    (baseDelay + Math.random() * PIGEON_WAVE_DELAY_JITTER) * pigeonMul
  trackedTimeout(() => {
    if (currentDeps !== deps) return
    const waveSize = pickWaveSize(deps.getLevel())
    if (waveSize >= 2 && deps.showToast) {
      deps.showToast(`⚠️ 비둘기 ${waveSize}마리!`, 'var(--color-danger)')
    }
    const shuffled = shuffleEdges(WAVE_EDGES)
    for (let i = 0; i < waveSize; i++) {
      const edge = shuffled[i % WAVE_EDGES.length]
      const memberDelay = i * PIGEON_WAVE_MEMBER_SPACING
      if (memberDelay === 0) {
        deps.spawnPigeon(edge)
      } else {
        trackedTimeout(() => {
          if (currentDeps !== deps) return
          deps.spawnPigeon(edge)
        }, memberDelay)
      }
    }
    schedulePigeonWave(deps)
  }, delay)
}
