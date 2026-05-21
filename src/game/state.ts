// === 좌표 ===
export type Vec2 = {
  x: number
  y: number
}

// === 캐릭터 ===
// 위치/속도/방향만 보유. 효과 시간은 EffectState로 일원화.
export type CharacterRef = Vec2 & {
  vx: number
  vy: number
  facing: 'left' | 'right'
}

// === 비둘기 ===
// 'flying' = 냐냐 직격 타겟팅 (기본). 'fleeing' = 츄 접근으로 vy -= 0.08 떠오름.
// 츄 접근으로 인한 fleeing 전환은 C-3' 충돌 검사에서 처리한다.
export type PigeonState = 'flying' | 'fleeing'

export type PigeonRef = Vec2 & {
  vx: number
  vy: number
  spawnedAt: number
  state: PigeonState
}

// === 아이템 ===
// 솔로/PvP 모두 동일 타입, 모드별 효과 분기는 사용 측 책임
export type ItemKind = 'kibble' | 'fish' | 'cucumber' | 'sweetPotato'

export type ItemRef = Vec2 & {
  kind: ItemKind
  spawnedAt: number
}

// === 파티클 / 부유 텍스트 ===
export type ParticleRef = Vec2 & {
  vx: number
  vy: number
  life: number // 남은 프레임 수
  color: string
  size: number
}

export type FloatTextRef = Vec2 & {
  text: string
  life: number
  color: string
}

// === 토스트 ===
export type ToastRef = {
  id: string
  msg: string
  color: string
  expireAt: number
}

// === 고양이 AI 상태 ===
// catTarget: wandering 목표점 (scheduleCatTarget이 0.6~3s 간격으로 갱신).
// cat.lastDashAt: "다음 dash 가능한 시각" — `now > lastDashAt`이면 발동 가능.
export type AIState = {
  cat: { lastDashAt: number }
  catTarget: Vec2
}

// === 게임 모드 / 상태 ===
export type GameMode = 'solo' | 'pvp'
export type GameState = 'idle' | 'playing' | 'gameover'

// === 효과 상태 ===
// PvP에서 어느 쪽이 아이템을 픽업했는지
export type PickerSide = 'chi' | 'cat'

// 효과 만료 타임스탬프 (Date.now() 기준). null이면 비활성.
// 활성 판정은 `effect && effect.until > now`.
// mega는 chiBoost에만 의미 있음 (메가 부스트 = 콤보 보상). 다른 effect는 무시.
export interface TimedEffect {
  until: number
  mega?: boolean
}

// 게임 루프가 보유하는 전역 효과 트래커 (effects.ts가 mutate)
export interface EffectState {
  chiBoost: TimedEffect | null
  chiSlow: TimedEffect | null
  catSpeedup: TimedEffect | null
  catSlow: TimedEffect | null
  chiShield: TimedEffect | null
  catShield: TimedEffect | null
}

// === 히스토리 항목 ===
export type SoloHistoryEntry = {
  id: string
  score: number
  level: number
  elapsed: number // ms
  date: string // ISO
}

export type PvpHistoryEntry = {
  id: string
  winner: 'chi' | 'cat' | 'draw'
  kissCount: number
  elapsed: number // ms
  date: string // ISO
}
