import { GAME_BGS, SPACE_BG } from '@/assets'

// 배경 매핑 — LV0=bg-1, LV1=bg-2, ..., LV9=bg-10. LV10+은 우주맵(무한 성장).
export function getBackgroundForLevel(level: number): string {
  if (level >= GAME_BGS.length) return SPACE_BG
  return GAME_BGS[Math.max(0, level)]
}

export function getRandomBackground(): string {
  const idx = Math.floor(Math.random() * GAME_BGS.length)
  return GAME_BGS[idx]
}
