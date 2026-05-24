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
  id: string
  vx: number
  vy: number
  spawnedAt: number
  state: PigeonState
}

// === 아이템 ===
// 솔로/PvP 모두 동일 타입, 모드별 효과 분기는 사용 측 책임.
// id는 React key용 unique string. expireAt 만료 처리는 expireTransients(C-5')에서.
export type ItemKind = 'kibble' | 'fish' | 'cucumber' | 'sweetPotato'

export type ItemRef = Vec2 & {
  id: string
  kind: ItemKind
  spawnedAt: number
  expireAt: number
}

// === 파티클 / 부유 텍스트 ===
// id는 React key용 unique number. rot/vr은 하트 회전 표현 — kiss/levelUp burst 사용.
export type ParticleRef = Vec2 & {
  id: number
  vx: number
  vy: number
  vr: number // 회전 속도 (deg/frame)
  rot: number // 현재 회전 (deg)
  life: number // 남은 프레임 수
  color: string
  size: number
}

// "+1" 같은 짧은 텍스트가 좌표 위로 떠오르며 페이드아웃.
// 만료 처리는 `until <= now` 시 expireTransients(C-5')에서 splice.
export type FloatTextRef = Vec2 & {
  id: number
  text: string
  color: string
  until: number
}

// 비둘기 차단 시 (chi/shield/kiss) 발생하는 흰 ring 충격파.
// 위치는 차단 지점(비둘기 좌표), 0.3s 동안 CSS keyframe shockwave-expand로 확장 + 페이드.
// 만료 splice는 expireTransients에서.
export type ShockwaveRef = Vec2 & {
  id: number
  until: number
}

// === 토스트 ===
// 우측 상단 max 3개 스택. 라우트 state로 관리하지만 UI 컴포넌트와 같은 타입을 공유.
export type ToastRef = {
  id: number
  text: string
  color: string
  until: number
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
export type GameState =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'confirmQuit'
  | 'gameover'

// === 효과 상태 ===
// PvP에서 어느 쪽이 아이템을 픽업했는지
export type PickerSide = 'chi' | 'cat'

// 효과 만료 타임스탬프 (Date.now() 기준). until 항상 number, 비활성은 `until: 0`.
// 활성 판정은 `effect.until > now`.
// mega는 chiBoost에만 의미 있음 (메가 부스트 = 콤보 보상). 다른 effect는 무시.
export interface TimedEffect {
  until: number
  mega?: boolean
}

// 점수 ×N 도장. value는 활성 배율. until=0이면 1x로 fallback (호출 측 책임).
export interface ScoreMultEffect {
  value: number
  until: number
}

// 게임 루프가 보유하는 전역 효과 트래커 (effects.ts가 mutate)
// chiSad는 PvP에서 catShield 막힘 시 1.5초간 sad 스프라이트 전환 (솔로엔 활성화 X).
// chiShield는 F-2 이후 분기 추가 예정.
export interface EffectState {
  chiBoost: TimedEffect
  chiSlow: TimedEffect
  chiSad: TimedEffect
  catSpeedup: TimedEffect
  catSlow: TimedEffect
  catShield: TimedEffect
  scoreMult: ScoreMultEffect
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
