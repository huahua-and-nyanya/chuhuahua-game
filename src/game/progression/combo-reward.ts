import {
  GAME_HEIGHT,
  GAME_WIDTH,
  ITEM_LIFETIME,
  MEGA_DURATION,
  SCORE_MULT,
  SCORE_MULT_DURATION,
} from '@/game/constants'
import { applyChiBoost } from '@/game/effects'
import type { GameRefs } from '@/game/loop/state'
import { clamp } from '@/game/physics'
import type { ItemKind } from '@/game/state'

// 5콤보마다 보상. 4지선다 균등 랜덤 — 한 번 발동되면 prevComboMilestone에 박혀
// 같은 콤보 값에서 재발동 X. expireCombo에서 콤보가 끊기면 0으로 풀리며 다시 발동 가능.
// 색상은 var(--color-game-*) CSS 변수 참조 — 컴포넌트의 inline style/className로 직접 사용.

export type ComboRewardId = 'mult2x' | 'kibble' | 'fish' | 'mega'

export type ComboReward = {
  id: ComboRewardId
  name: string
  color: string
}

export const COMBO_REWARDS: ComboReward[] = [
  {
    id: 'mult2x',
    name: '2배 점수 5초!',
    color: 'var(--color-game-accent-gold)',
  },
  { id: 'kibble', name: '사료 보너스!', color: 'var(--color-game-warn)' },
  {
    id: 'fish',
    name: '물고기 보너스!',
    color: 'var(--color-game-shield-blue)',
  },
  { id: 'mega', name: '메가 부스트!', color: 'var(--color-game-mega)' },
]

// 콤보 보너스 아이템이 chi 중심에서 떨어질 최대 반경.
const COMBO_SPAWN_RADIUS = 120
const COMBO_SPAWN_MARGIN = 80

export type RollComboRewardParams = {
  refs: GameRefs
  combo: number
  now: number
  showToast: (text: string, color: string) => void
  // wedding 게임변형 모드 — 기본 아이템(kibble/fish) 보너스 후보 제외(효과형 mult2x/mega만).
  weddingMode?: boolean
}

export function rollComboReward(params: RollComboRewardParams): void {
  const { refs, combo, now, showToast, weddingMode } = params
  const sm = refs.scoreMirror

  // 5콤보 보장 가드.
  if (combo === 0 || combo % 5 !== 0) return
  if (sm.prevComboMilestone === combo) return
  sm.prevComboMilestone = combo

  // wedding 모드면 기본 아이템 스폰 보상(kibble/fish)을 후보에서 빼 일반 아이템 누출을 막는다.
  const pool = weddingMode
    ? COMBO_REWARDS.filter((r) => r.id === 'mult2x' || r.id === 'mega')
    : COMBO_REWARDS
  const reward = pool[Math.floor(Math.random() * pool.length)]
  showToast(reward.name, reward.color)

  if (reward.id === 'mult2x') {
    refs.effects.scoreMult = {
      value: SCORE_MULT,
      until: now + SCORE_MULT_DURATION,
    }
    return
  }
  if (reward.id === 'mega') {
    applyChiBoost(refs, now, MEGA_DURATION, { mega: true })
    return
  }
  // kibble / fish — chi 주변 ±RADIUS 즉시 스폰. 같은 종 기존 아이템은 제거 후 push.
  spawnComboItem(refs, now, reward.id)
}

function spawnComboItem(refs: GameRefs, now: number, kind: ItemKind): void {
  const chi = refs.chi
  refs.items = refs.items.filter((it) => it.kind !== kind)
  refs.items.push({
    id: `${kind}-combo-${now}`,
    kind,
    x: clamp(
      chi.x + (Math.random() - 0.5) * 2 * COMBO_SPAWN_RADIUS,
      COMBO_SPAWN_MARGIN,
      GAME_WIDTH - COMBO_SPAWN_MARGIN,
    ),
    y: clamp(
      chi.y + (Math.random() - 0.5) * 2 * COMBO_SPAWN_RADIUS,
      COMBO_SPAWN_MARGIN,
      GAME_HEIGHT - COMBO_SPAWN_MARGIN,
    ),
    spawnedAt: now,
    expireAt: now + ITEM_LIFETIME,
  })
}
