import {
  GAME_HEIGHT,
  GAME_WIDTH,
  ITEM_LIFETIME,
  PIGEON_SPEED_BASE,
  PIGEON_SPEED_PER_LEVEL,
} from '@/game/constants'
import type { BgHeart, GameRefs } from '@/game/loop/state'
import type { SoloSpawnKind } from '@/game/loop/spawn'

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
const PIGEON_SPAWN_MARGIN = 60
const PIGEON_OFFSCREEN = 50
const ITEM_SPAWN_MARGIN = 80

// 고유 id 충돌 방지용 카운터. 모듈 스코프 단일 인스턴스 (사이클 C 제약).
let pigeonCounter = 0
let itemCounter = 0

type Edge = 'top' | 'bottom' | 'left' | 'right'
const EDGES: Edge[] = ['top', 'bottom', 'left', 'right']

export function spawnPigeon(refs: GameRefs, now: number): void {
  const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
  const horizontalX =
    PIGEON_SPAWN_MARGIN + Math.random() * (GAME_WIDTH - 2 * PIGEON_SPAWN_MARGIN)
  const verticalY =
    PIGEON_SPAWN_MARGIN +
    Math.random() * (GAME_HEIGHT - 2 * PIGEON_SPAWN_MARGIN)
  let x: number
  let y: number
  if (edge === 'top') {
    x = horizontalX
    y = -PIGEON_OFFSCREEN
  } else if (edge === 'bottom') {
    x = horizontalX
    y = GAME_HEIGHT + PIGEON_OFFSCREEN
  } else if (edge === 'left') {
    x = -PIGEON_OFFSCREEN
    y = verticalY
  } else {
    x = GAME_WIDTH + PIGEON_OFFSCREEN
    y = verticalY
  }

  const dx = refs.cat.x - x
  const dy = refs.cat.y - y
  const d = Math.hypot(dx, dy) || 1
  const speed =
    PIGEON_SPEED_BASE + refs.scoreMirror.level * PIGEON_SPEED_PER_LEVEL

  refs.pigeons.push({
    id: `pigeon-${now}-${pigeonCounter++}`,
    x,
    y,
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
