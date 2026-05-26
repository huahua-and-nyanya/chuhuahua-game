// PvP 한 판 기록. localStorage에 배열로 저장 — date DESC (최신 위) 정렬.
// 솔로(features/history/types.ts SoloEntry)와 도메인 분리.
// winner: 무승부 개념 없음 — kissCount>=GOAL이면 chi, time expire면 cat.
// date: 솔로와 일관성 위해 number(Date.now() ms). state.ts의 PvpHistoryEntry는 미사용 (ISO string 표기였음 — 본 PvpEntry로 통일).

export type PvpEntry = {
  id: string
  winner: 'chi' | 'cat'
  kissCount: number
  elapsed: number // ms — 시간 만료(cat 승)는 PVP_TIME_LIMIT 그대로
  date: number // Date.now() 기준 ms
}

export type PvpEntryInput = Omit<PvpEntry, 'id' | 'date'>
