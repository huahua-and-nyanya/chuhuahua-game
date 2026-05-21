import type {
  AIState,
  CharacterRef,
  EffectState,
  FloatTextRef,
  ItemRef,
  ParticleRef,
  PigeonRef,
  Vec2,
} from '@/game/state'

// === 시각 효과 ===

// 배경에 떠다니는 하트. life는 남은 프레임 수, 0 이하면 인플레이스 제거.
export type BgHeart = Vec2 & {
  vx: number
  vy: number
  life: number
  size: number
  alpha: number
}

// === 점수 미러 ===
// React state는 30fps 렌더 게이트에 묶이므로,
// 게임 로직은 본 ref 미러에 즉시 반영한 뒤 다음 forceRender에 보여준다.
export type ScoreMirror = {
  score: number
  combo: number
  maxCombo: number
  level: number
}

// === 트랜지언트 플래그 ===
// active=true는 게임 루프가 매 프레임 until과 비교해 자동 해제.
export type TransientFlag = {
  active: boolean
  until: number
}

// mwah("쪽!") 텍스트는 위치 정보를 함께 보유 — chi/cat 중점에서 표시한다.
export type MwahFlag = TransientFlag & Vec2

export type LevelUpEffect = TransientFlag & {
  level: number
}

// === 게임 ref 컨테이너 ===
// /solo 라우트에서 `useRef(createInitialState())`로 한 번만 생성한다.
export type GameRefs = {
  chi: CharacterRef
  cat: CharacterRef
  pigeons: PigeonRef[]
  items: ItemRef[]
  effects: EffectState
  ai: AIState
  scoreMirror: ScoreMirror
  floatTexts: FloatTextRef[]
  particles: ParticleRef[]
  bgHearts: BgHeart[]
  mwah: MwahFlag
  kissing: TransientFlag
  flash: { until: number }
  levelUpEffect: LevelUpEffect
}

export function createInitialState(): GameRefs {
  // 게임 영역 640x480 기준 좌우 대칭 배치
  return {
    chi: { x: 200, y: 240, vx: 0, vy: 0, facing: 'right' },
    cat: { x: 440, y: 240, vx: 0, vy: 0, facing: 'left' },
    pigeons: [],
    items: [],
    effects: {
      chiBoost: { until: 0 },
      chiSlow: { until: 0 },
      catSpeedup: { until: 0 },
      catSlow: { until: 0 },
      catShield: { until: 0 },
      scoreMult: { value: 1, until: 0 },
    },
    ai: {
      cat: { lastDashAt: 0 },
      catTarget: { x: 500, y: 240 },
    },
    scoreMirror: { score: 0, combo: 0, maxCombo: 0, level: 0 },
    floatTexts: [],
    particles: [],
    bgHearts: [],
    mwah: { active: false, until: 0, x: 0, y: 0 },
    kissing: { active: false, until: 0 },
    flash: { until: 0 },
    levelUpEffect: { active: false, until: 0, level: 0 },
  }
}
