import {
  GAME_HEIGHT,
  GAME_WIDTH,
  ITEM_LIFETIME,
  PIGEON_HARD_CAP,
  PIGEON_SPEED_BASE,
  PIGEON_SPEED_PER_LEVEL,
} from '@/game/constants'
import type { BgHeart, GameRefs } from '@/game/loop/state'
import type { SoloSpawnKind } from '@/game/loop/spawn'
import type { PigeonEdge } from '@/game/state'

// === 배경 부유 하트 ===
// 게임 시작/리셋 시 12개 init. 매 RAF updateBgHearts가 위로 끌어올리며 wrap.
const BG_HEART_COUNT = 12
const BG_HEART_COLORS = ['#ff85a1', '#ffd1dc', '#ffadc6', '#ff9ec1']

export function initBgHearts(): BgHeart[] {
  return Array.from({ length: BG_HEART_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * GAME_WIDTH,
    y: Math.random() * GAME_HEIGHT,
    size: 12 + Math.random() * 18,
    speed: 0.25 + Math.random() * 0.55,
    drift: (Math.random() - 0.5) * 0.4,
    opacity: 0.18 + Math.random() * 0.22,
    color: BG_HEART_COLORS[i % BG_HEART_COLORS.length],
  }))
}

// 매 RAF(60fps) 호출. in-place mutation으로 위로 올라가며 좌우 흔들림.
// 위로 벗어나면 아래에서 재등장 + x 새로 랜덤. 좌우 경계는 wrap.
export function updateBgHearts(hearts: BgHeart[]): void {
  for (const h of hearts) {
    h.y -= h.speed
    h.x += h.drift
    if (h.y < -h.size) {
      h.y = GAME_HEIGHT + h.size
      h.x = Math.random() * GAME_WIDTH
    }
    if (h.x < -h.size) h.x = GAME_WIDTH + h.size
    if (h.x > GAME_WIDTH + h.size) h.x = -h.size
  }
}

// reference 1089~1108 패턴: 4방향 화면 밖 → 화면 가장자리 안쪽 좌표로 진입.
// 비둘기는 cat 방향 벡터로 초기 vx/vy 부여. 이후 매 프레임 pigeon-fly.ts가 lerp로 갱신.
const PIGEON_OFFSCREEN = 50
const ITEM_SPAWN_MARGIN = 80

// 경고 마커 위치 — 게임 영역 가장자리 안쪽 30px (reference 1090~1097).
const WARN_INSET = 30
const WARN_RANGE_INSET = 60 // edge 평행축 시작 마진 (reference 60 + Math.random()*(W-120))

// 고유 id 충돌 방지용 카운터. 모듈 스코프 단일 인스턴스 (사이클 C 제약).
let pigeonCounter = 0
let warningCounter = 0
let itemCounter = 0

const EDGES: PigeonEdge[] = ['top', 'bottom', 'left', 'right']

// 비둘기 등장 위치/경고 마커 좌표를 한 번에 계산해 warnings에 push.
// commitPigeonAt에 spawnX/spawnY/edge가 필요해 본 함수가 함께 반환한다.
//
// reference 1090~1097 edge별 분기 그대로:
//   top/bottom: warnX/spawnX = 60 + random*(W-120), warnY = 30 or H-30, spawnY = -50 or H+50
//   left/right: warnY/spawnY = 60 + random*(H-120), warnX = 30 or W-30, spawnX = -50 or W+50
export type PigeonWarningSpawn = {
  wid: string
  edge: PigeonEdge
  spawnX: number
  spawnY: number
}

export function spawnPigeonWarning(
  refs: GameRefs,
  now: number,
  forcedEdge?: PigeonEdge,
): PigeonWarningSpawn {
  const edge = forcedEdge ?? EDGES[Math.floor(Math.random() * EDGES.length)]
  let warnX: number
  let warnY: number
  let spawnX: number
  let spawnY: number
  if (edge === 'top') {
    warnX =
      WARN_RANGE_INSET + Math.random() * (GAME_WIDTH - 2 * WARN_RANGE_INSET)
    warnY = WARN_INSET
    spawnX = warnX
    spawnY = -PIGEON_OFFSCREEN
  } else if (edge === 'bottom') {
    warnX =
      WARN_RANGE_INSET + Math.random() * (GAME_WIDTH - 2 * WARN_RANGE_INSET)
    warnY = GAME_HEIGHT - WARN_INSET
    spawnX = warnX
    spawnY = GAME_HEIGHT + PIGEON_OFFSCREEN
  } else if (edge === 'left') {
    warnX = WARN_INSET
    warnY =
      WARN_RANGE_INSET + Math.random() * (GAME_HEIGHT - 2 * WARN_RANGE_INSET)
    spawnX = -PIGEON_OFFSCREEN
    spawnY = warnY
  } else {
    warnX = GAME_WIDTH - WARN_INSET
    warnY =
      WARN_RANGE_INSET + Math.random() * (GAME_HEIGHT - 2 * WARN_RANGE_INSET)
    spawnX = GAME_WIDTH + PIGEON_OFFSCREEN
    spawnY = warnY
  }
  const wid = `warn-${now}-${warningCounter++}`
  refs.warnings.push({ id: wid, x: warnX, y: warnY, edge })
  return { wid, edge, spawnX, spawnY }
}

export function removeWarning(refs: GameRefs, wid: string): void {
  refs.warnings = refs.warnings.filter((w) => w.id !== wid)
}

// reference 1099~1108: 1300ms 후 실제 비둘기 push. vx/vy는 cat 방향 정규화 × 레벨 속도.
export function commitPigeonAt(
  refs: GameRefs,
  spawnX: number,
  spawnY: number,
  now: number,
): void {
  // 성능 안전망 — 필드 비둘기가 하드 캡에 닿으면 조용히 스킵 (정상 플레이에선 도달 안 함).
  if (refs.pigeons.length >= PIGEON_HARD_CAP) return
  const dx = refs.cat.x - spawnX
  const dy = refs.cat.y - spawnY
  const d = Math.hypot(dx, dy) || 1
  const speed =
    PIGEON_SPEED_BASE + refs.scoreMirror.level * PIGEON_SPEED_PER_LEVEL

  refs.pigeons.push({
    id: `pigeon-${now}-${pigeonCounter++}`,
    x: spawnX,
    y: spawnY,
    vx: (dx / d) * speed,
    vy: (dy / d) * speed,
    spawnedAt: now,
    state: 'flying',
  })
}

export function spawnItem(
  refs: GameRefs,
  kind: SoloSpawnKind,
  now: number,
): void {
  refs.items.push({
    id: `${kind}-${now}-${itemCounter++}`,
    kind,
    x: ITEM_SPAWN_MARGIN + Math.random() * (GAME_WIDTH - 2 * ITEM_SPAWN_MARGIN),
    y:
      ITEM_SPAWN_MARGIN + Math.random() * (GAME_HEIGHT - 2 * ITEM_SPAWN_MARGIN),
    spawnedAt: now,
    expireAt: now + ITEM_LIFETIME,
  })
}
