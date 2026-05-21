// 솔로 엔드리스 기록 1건. localStorage에 배열로 저장 — score DESC 정렬.
// 닉네임은 한 줄 12자 제한 (GameOverModal). 익명 등록(skip)은 entries에 push X.
export type SoloEntry = {
  id: string
  name: string
  score: number
  maxLevel: number
  maxCombo: number
  elapsedMs: number
  date: number // Date.now() 기준 ms
}

// 등록 시 외부에서 채우는 필드 — id/date는 useHistory가 자동 채움.
export type SoloEntryInput = Omit<SoloEntry, 'id' | 'date'>

// 상위 N위 한정으로 랭크 표시. 그 외는 null 반환 → 닉네임 입력 자체를 숨김.
export const RANK_TOP_N = 10
