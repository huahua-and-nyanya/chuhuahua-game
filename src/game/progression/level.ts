import {
  LEVEL_THRESHOLDS,
  LEVEL_UP_DURATION,
  MAX_LEVEL,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'

// reference 1641 computeLevel + 1880~ 식 레벨업 트리거 패턴.
// LEVEL_THRESHOLDS = [0, 10, 25, 45, 70, 100, 135, 175, 220, 270, 325] (길이 11, LV0~LV10).

// 점수에 해당하는 최대 레벨. 임계점을 통과한 가장 큰 인덱스를 반환.
export function computeLevel(score: number): number {
  for (let i = MAX_LEVEL; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i]) return i
  }
  return 0
}

export type CheckLevelUpParams = {
  refs: GameRefs
  oldScore: number
  newScore: number
  now: number
  onLevelUp: (newLevel: number) => void
}

// 점수 증가로 레벨이 올랐는지 검사하고, 올랐으면 levelUpEffect 트리거 + 콜백 호출.
// 18개 금하트 파티클 / 토스트 같은 시각 효과는 라우트(C-5')의 onLevelUp이 책임.
export function checkLevelUp(params: CheckLevelUpParams): void {
  const { refs, oldScore, newScore, now, onLevelUp } = params
  const oldLevel = computeLevel(oldScore)
  const newLevel = computeLevel(newScore)
  if (newLevel <= oldLevel) return

  refs.scoreMirror.level = newLevel
  refs.levelUpEffect = {
    active: true,
    until: now + LEVEL_UP_DURATION,
    level: newLevel,
  }
  onLevelUp(newLevel)
}

// 의미 있는 레벨 마일스톤 — 토스트 강조용. 라우트에서 isMilestoneLevel(newLevel) 분기.
export function isMilestoneLevel(level: number): boolean {
  return level === 2 || level === 3 || level === 5 || level === 7
}
