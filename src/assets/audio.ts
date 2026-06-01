export const AUDIO_ASSETS = {
  bgmTitle: '/assets/audio/bgm-title.mp3',
  bgmMain: '/assets/audio/bgm-main.mp3',
  bgmPvp: '/assets/audio/bgm-pvp.mp3',
  bgmCalm: '/assets/audio/bgm-calm.mp3',
  sfxGameover: '/assets/audio/sfx-gameover.mp3',
} as const

export type AudioKey = keyof typeof AUDIO_ASSETS

// bgm(loop)과 sfx(1회)를 타입으로 분리 — playBgm/playSfx가 서로 섞이지 않게.
export type BgmTrack = 'bgmTitle' | 'bgmMain' | 'bgmPvp' | 'bgmCalm'
export type SfxTrack = 'sfxGameover'
