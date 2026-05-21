import {
  GAME_HEIGHT,
  GAME_WIDTH,
  ITEM_LIFETIME,
  PIGEON_SPEED_BASE,
  PIGEON_SPEED_PER_LEVEL,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import type { SoloSpawnKind } from '@/game/loop/spawn'

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
