import {
  GAME_HEIGHT,
  GAME_WIDTH,
  LEVEL_THRESHOLDS,
  LEVEL_UP_DURATION,
  MAX_LEVEL,
  WEDDING_LEVEL_THRESHOLDS,
  WEDDING_MAX_LEVEL,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { addParticles } from '@/game/particles'
import type { ParticleRef } from '@/game/state'

// 레벨업 burst — 게임 중앙에서 18개 금하트 폭발. 골드+핑크 5색.
const LEVEL_UP_COLORS = ['#fbbf24', '#ffaa00', '#fcd34d', '#ff3d7f', '#ffeb3b']

function spawnLevelUpBurst(refs: GameRefs, now: number): void {
  const cx = GAME_WIDTH / 2
  const cy = GAME_HEIGHT / 2
  const burst: ParticleRef[] = []
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2
    const speed = 6 + Math.random() * 5
    burst.push({
      id: now + i + Math.random(),
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      vr: (Math.random() - 0.5) * 18,
      rot: Math.random() * 360,
      size: 16 + Math.random() * 12,
      life: 32 + Math.random() * 14,
      color: LEVEL_UP_COLORS[i % LEVEL_UP_COLORS.length],
    })
  }
  addParticles(refs.particles, burst)
}

// reference 1641 computeLevel + 1880~ 식 레벨업 트리거 패턴.
// LEVEL_THRESHOLDS = [0, 10, 25, 45, 70, 100, 135, 175, 220, 270, 325] (길이 11, LV0~LV10).

// 점수에 해당하는 최대 레벨. 임계점을 통과한 가장 큰 인덱스를 반환.
// weddingMode면 5압축 곡선(WEDDING_*)으로 산출 — LV5 캡. 일반 호출은 기존 곡선 그대로.
export function computeLevel(score: number, weddingMode = false): number {
  const thresholds = weddingMode ? WEDDING_LEVEL_THRESHOLDS : LEVEL_THRESHOLDS
  const maxLevel = weddingMode ? WEDDING_MAX_LEVEL : MAX_LEVEL
  for (let i = maxLevel; i >= 0; i--) {
    if (score >= thresholds[i]) return i
  }
  return 0
}

export type CheckLevelUpParams = {
  refs: GameRefs
  oldScore: number
  newScore: number
  now: number
  onLevelUp: (newLevel: number) => void
  // wedding 게임변형 — 5압축 곡선으로 레벨 산출. 미지정 시 일반 곡선.
  weddingMode?: boolean
}

// 점수 증가로 레벨이 올랐는지 검사하고, 올랐으면 levelUpEffect 트리거 + 콜백 호출.
// 18개 금하트 파티클 / 토스트 같은 시각 효과는 라우트(C-5')의 onLevelUp이 책임.
export function checkLevelUp(params: CheckLevelUpParams): void {
  const { refs, oldScore, newScore, now, onLevelUp, weddingMode } = params
  const oldLevel = computeLevel(oldScore, weddingMode)
  const newLevel = computeLevel(newScore, weddingMode)
  if (newLevel <= oldLevel) return

  refs.scoreMirror.level = newLevel
  refs.levelUpEffect = {
    active: true,
    until: now + LEVEL_UP_DURATION,
    level: newLevel,
  }
  spawnLevelUpBurst(refs, now)
  onLevelUp(newLevel)
}

// 의미 있는 레벨 마일스톤 — 토스트 강조용. 라우트에서 isMilestoneLevel(newLevel) 분기.
export function isMilestoneLevel(level: number): boolean {
  return level === 2 || level === 3 || level === 5 || level === 7
}
