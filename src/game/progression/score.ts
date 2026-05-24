import { COMBO_WINDOW } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'

// reference 1796~1800 + 1843: 점수 산식 (난이도 강화: 콤보 가중 floor/3).
//   kiss          → 1 + floor(oldCombo/3). 콤보 가중 약화 — 큰 콤보의 점수 폭주 완화.
//   pigeon-block  → +1 (콤보 무관).
//   shield-block  → +1 (콤보 무관, 뽀뽀 차단도 본 카테고리).
// scoreMult.until > now 시 ×value (보통 2). value=1이면 fallback.
// fish 픽업 자체는 점수 X (catShield 부여만).

export type ScoreEvent = 'kiss' | 'pigeon-block' | 'shield-block'

export type ApplyScoreParams = {
  refs: GameRefs
  event: ScoreEvent
  now: number
  // kiss 이벤트 한정: kiss.ts가 lastKissAt 갱신 전의 prev 값을 전달.
  // 갱신 후의 sm.lastKissAt을 읽으면 항상 0이 돼 콤보가 끊기지 않는 버그가 나기 때문.
  prevLastKissAt?: number
}

export function applyScore(params: ApplyScoreParams): void {
  const { refs, event, now } = params
  const sm = refs.scoreMirror
  const mult =
    refs.effects.scoreMult.until > now ? refs.effects.scoreMult.value : 1

  if (event === 'kiss') {
    const lastKiss = params.prevLastKissAt ?? sm.lastKissAt
    const oldCombo = sm.combo
    sm.combo = now - lastKiss < COMBO_WINDOW ? oldCombo + 1 : 1
    sm.maxCombo = Math.max(sm.maxCombo, sm.combo)
    sm.score += Math.round((1 + Math.floor(oldCombo / 3)) * mult)
    return
  }
  sm.score += Math.round(1 * mult)
}

// 매 프레임 update에서 호출. 콤보가 살아있고 마지막 뽀뽀 후 COMBO_WINDOW 경과 시
// 콤보를 0으로 리셋. 콤보 보상 가드(prevComboMilestone)도 같이 0으로 풀어
// 같은 콤보 값에서 다시 보상받을 수 있게 한다.
export function expireCombo(refs: GameRefs, now: number): void {
  const sm = refs.scoreMirror
  if (sm.combo > 0 && now - sm.lastKissAt > COMBO_WINDOW) {
    sm.combo = 0
    sm.prevComboMilestone = 0
  }
}
