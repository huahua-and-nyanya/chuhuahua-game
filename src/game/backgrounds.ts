import { GAME_BGS, SPACE_BG, WEDDING_BGS } from '@/assets'

// 배경 매핑 — LV0=bg-1, LV1=bg-2, ..., LV9=bg-10. LV10+은 우주맵(무한 성장).
// weddingMode면 wedding 6장으로 분기: 레벨에 idx 직결(LV0=신혼집 … LV5=제단), LV5+ 캡.
export function getBackgroundForLevel(
  level: number,
  weddingMode = false,
): string {
  if (weddingMode) {
    const idx = Math.min(WEDDING_BGS.length - 1, Math.max(0, level))
    return WEDDING_BGS[idx]
  }
  if (level >= GAME_BGS.length) return SPACE_BG
  return GAME_BGS[Math.max(0, level)]
}

export function getRandomBackground(): string {
  const idx = Math.floor(Math.random() * GAME_BGS.length)
  return GAME_BGS[idx]
}
