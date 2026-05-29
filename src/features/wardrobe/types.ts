export type Grade = 'B' | 'A' | 'S' | 'S+'

export type ApplyTo = 'idle' | 'all'

export interface ClothEffects {
  chiSpeedMul?: number
  catSpeedMul?: number
  pigeonSpawnMul?: number
  itemSpawnMul?: number
  // S+ 전용 게임변형 필드
  pigeonDisabled?: boolean
  backgroundOverride?: string
  triggerEnding?: string
}

export interface ClothEntry {
  id: string
  name: string
  grade: Grade
  pair: boolean
  applyTo: ApplyTo
  effects?: ClothEffects
  description?: string
  kissingAsset?: boolean // true면 chi/cat-{id}-kissing.png 존재 (현재 propose만)
  endingId?: string // LV10 도달 시 엔딩 컷신 트리거 마커
}

export interface WardrobeState {
  owned: string[] // 보유 옷 id 배열
  equipped: string | null // 장착 옷 id
}

export interface PlayStats {
  proposeEndingCleared: boolean
}

export type GachaResult =
  | { error: true; message: string }
  | { error: false; cloth: ClothEntry; alreadyOwned: boolean }
