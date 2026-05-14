import { GAME_BGS, SPACE_BG } from '@/assets';

export function getBackgroundForLevel(level: number): string {
  if (level > GAME_BGS.length) return SPACE_BG;
  return GAME_BGS[level - 1];
}

export function getRandomBackground(): string {
  const idx = Math.floor(Math.random() * GAME_BGS.length);
  return GAME_BGS[idx];
}
