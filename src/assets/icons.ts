export const ICON_ASSETS = {
  help: '/assets/icons/icon-help.png',
  ranking: '/assets/icons/icon-ranking.png',
} as const

export type IconKey = keyof typeof ICON_ASSETS
