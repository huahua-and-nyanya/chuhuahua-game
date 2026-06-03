import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PIGEON_SPEED_BASE,
  PIGEON_SPEED_PER_LEVEL,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { frameScale } from '@/game/physics'
import { difficultyLevel } from '@/game/progression/level'

// 화면 밖 cull margin — reference 1765: 양옆/위아래 모두 120px.
const OFFSCREEN_MARGIN = 120

// reference 1747~1770:
// - state==='flying': cat 위치를 직격 타겟팅. lerp 0.08로 속도 가속.
// - 그 외 ('fleeing'): vy -= 0.08 으로 위로 떠오름 (chi가 놀라게 한 비둘기가 도주).
// 위치 갱신은 x += vx; y += vy (dt 정규화 없음, RAF 60fps 가정).
// 츄 60px 내 접근 시 fleeing 전환 책임은 C-3' pigeon-hit.ts에 있음.
// dt 인자는 호환용으로만 받음.
export function updatePigeons(refs: GameRefs, level: number, dt: number): void {
  const s = frameScale(dt)
  const { pigeons, cat } = refs
  // LV6+ 후반 압축 — difficultyLevel로 레벨 기울기를 완만하게(LV10 5.6 → 4.6).
  const psp =
    PIGEON_SPEED_BASE + difficultyLevel(level) * PIGEON_SPEED_PER_LEVEL

  const surviving: typeof pigeons = []
  for (const pigeon of pigeons) {
    let { x, y, vx, vy } = pigeon
    if (pigeon.state === 'flying') {
      const dx = cat.x - x
      const dy = cat.y - y
      const d = Math.hypot(dx, dy) || 1
      const tvx = (dx / d) * psp
      const tvy = (dy / d) * psp
      vx += (tvx - vx) * 0.08 * s
      vy += (tvy - vy) * 0.08 * s
    } else {
      // fleeing — 위로 떠오름 (reference 1762).
      vy -= 0.08 * s
    }
    x += vx * s
    y += vy * s
    if (
      x > -OFFSCREEN_MARGIN &&
      x < GAME_WIDTH + OFFSCREEN_MARGIN &&
      y > -OFFSCREEN_MARGIN &&
      y < GAME_HEIGHT + OFFSCREEN_MARGIN
    ) {
      pigeon.x = x
      pigeon.y = y
      pigeon.vx = vx
      pigeon.vy = vy
      surviving.push(pigeon)
    }
  }
  // pigeons 배열 자체를 새 배열로 교체 — reference 1770 패턴과 동일.
  // GameRefs.pigeons는 객체 필드라 재할당 가능.
  refs.pigeons = surviving
}
