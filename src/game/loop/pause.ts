import type { GameRefs } from './state'

// paused 동안 흐른 시간(pausedDuration)을 모든 timed value에 더해 보정한다.
// 게임 루프(useGameLoop)는 enabled=false로 정지하지만, performance.now()와 effect.until 값은
// 계속 흐름 → 그대로 두면 resume 직후 효과 게이지가 갑자기 0으로 표시되거나 만료 처리됨.
//
// 보정 대상:
// - EffectState (chiBoost/chiSlow/catSpeedup/catSlow/catShield/scoreMult)
// - transients (kissing/mwah/levelUpEffect)
// - floatTexts[].until
// - items[].expireAt
// - scoreMirror.lastKissAt (콤보 윈도우)
//
// 보정 안 함:
// - pigeons (vx/vy로 움직임 — paused 동안 update 안 도니 자연 정지, 시간 무관)
// - spawn scheduler / cat-target scheduler — trackedTimeout은 시간 보정 X.
//   pause 동안 spawn이 발생할 수 있으나 게임 루프가 멈춰있어 시각 X. resume 후 자연 재개.
//   (reference도 동일 방식 — 정확 보정 비용 vs 효과 차이 작음)
export function adjustTimersByPauseDuration(
  refs: GameRefs,
  pausedDuration: number,
): void {
  if (pausedDuration <= 0) return
  const e = refs.effects
  if (e.chiBoost.until > 0) e.chiBoost.until += pausedDuration
  if (e.chiSlow.until > 0) e.chiSlow.until += pausedDuration
  if (e.catSpeedup.until > 0) e.catSpeedup.until += pausedDuration
  if (e.catSlow.until > 0) e.catSlow.until += pausedDuration
  if (e.catShield.until > 0) e.catShield.until += pausedDuration
  if (e.scoreMult.until > 0) e.scoreMult.until += pausedDuration

  if (refs.kissing.until > 0) refs.kissing.until += pausedDuration
  if (refs.mwah.until > 0) refs.mwah.until += pausedDuration
  if (refs.levelUpEffect.until > 0) refs.levelUpEffect.until += pausedDuration
  if (refs.flash.until > 0) refs.flash.until += pausedDuration

  for (const f of refs.floatTexts) f.until += pausedDuration
  for (const i of refs.items) i.expireAt += pausedDuration

  if (refs.scoreMirror.lastKissAt > 0) {
    refs.scoreMirror.lastKissAt += pausedDuration
  }
}
