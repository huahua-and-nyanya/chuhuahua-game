import type { PlayStats, WardrobeState } from './types'

const WARDROBE_KEY = 'chuhuahua:wardrobe-v1'
// 코인은 기존 nav(useCoins)와 같은 키를 공유한다 — 저장소 분리 시 어긋남 방지.
const COINS_KEY = 'chuhuahua:coins'
const PITY_KEY = 'chuhuahua:gacha-pity-v1'
const PLAY_STATS_KEY = 'chuhuahua:play-stats-v1'

// localStorage 동기 API 사용. window.storage(레퍼런스 패턴) 아님.

export const wardrobeStorage = {
  load(): WardrobeState {
    try {
      const raw = localStorage.getItem(WARDROBE_KEY)
      if (!raw) return { owned: [], equipped: null }
      const parsed = JSON.parse(raw)
      return {
        owned: Array.isArray(parsed.owned) ? parsed.owned : [],
        equipped: typeof parsed.equipped === 'string' ? parsed.equipped : null,
      }
    } catch {
      return { owned: [], equipped: null }
    }
  },
  save(state: WardrobeState): void {
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(state))
  },
}

export const coinsStorage = {
  load(): number {
    try {
      const raw = localStorage.getItem(COINS_KEY)
      const n = raw ? JSON.parse(raw) : 0
      return typeof n === 'number' && n >= 0 ? n : 0
    } catch {
      return 0
    }
  },
  save(n: number): void {
    localStorage.setItem(COINS_KEY, JSON.stringify(n))
  },
}

export const pityStorage = {
  load(): number {
    try {
      const raw = localStorage.getItem(PITY_KEY)
      const n = raw ? JSON.parse(raw) : 0
      return typeof n === 'number' ? n : 0
    } catch {
      return 0
    }
  },
  save(n: number): void {
    localStorage.setItem(PITY_KEY, JSON.stringify(n))
  },
}

export const playStatsStorage = {
  load(): PlayStats {
    try {
      const raw = localStorage.getItem(PLAY_STATS_KEY)
      if (!raw) return { proposeEndingCleared: false }
      const parsed = JSON.parse(raw)
      return {
        proposeEndingCleared: parsed.proposeEndingCleared === true,
      }
    } catch {
      return { proposeEndingCleared: false }
    }
  },
  save(stats: PlayStats): void {
    localStorage.setItem(PLAY_STATS_KEY, JSON.stringify(stats))
  },
}
