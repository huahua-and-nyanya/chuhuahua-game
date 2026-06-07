export type Grade = 'B' | 'A' | 'S' | 'S+'

export type ApplyTo = 'idle' | 'all'

export interface ClothEffects {
  chiSpeedMul?: number
  catSpeedMul?: number
  pigeonSpawnMul?: number
  itemSpawnMul?: number // 전체 아이템 간격 배수 (<1 = 자주)
  aidItemSpawnMul?: number // 우호 아이템(kibble/fish)만 간격 배수 (<1 = 자주)
  // S+ 전용 게임변형 필드
  pigeonDisabled?: boolean
  itemPoolOverride?: string
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
  usedClothes: string[] // 게임변형 1회 시청 완료한 옷 id (S+ 효과 게이팅). write는 W3.
}

export interface PlayStats {
  proposeEndingCleared: boolean
  freeGachaUsed: boolean // 첫 옷장 진입 무료 가챠 1회 소진 여부
  // propose 엔딩 클리어 직후 1회용 — 다음 가챠를 확률 없이 S+(wedding) 확정으로 만든다.
  // 그 가챠가 실행되면 false로 소진. wedding 보유 시엔 무시.
  weddingGuaranteed: boolean
}

export type GachaResult =
  | { error: true; cost: number; have: number } // 코인 부족 — 필요/보유 코인
  // refund: 중복(alreadyOwned) 시 등급별 환불 코인 (신규면 0)
  | { error: false; cloth: ClothEntry; alreadyOwned: boolean; refund: number }
