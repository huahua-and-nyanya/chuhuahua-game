// === 좌표 ===
export type Vec2 = {
  x: number
  y: number
}

// === 캐릭터 ===
// 효과 만료 타임스탬프는 Date.now() 기준. 0이면 비활성.
export type CharacterRef = Vec2 & {
  vx: number
  vy: number
  facing: 'left' | 'right'
  boostUntil: number
  megaUntil: number
  shieldUntil: number
  slowUntil: number
}

// === 비둘기 ===
export type PigeonRef = Vec2 & {
  vx: number
  vy: number
  spawnedAt: number
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

// === 게임 모드 / 상태 ===
export type GameMode = 'solo' | 'pvp'
export type GameState = 'idle' | 'playing' | 'gameover'

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
