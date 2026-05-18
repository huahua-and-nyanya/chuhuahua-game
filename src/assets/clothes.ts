type Character = 'chi' | 'cat'
type AssetKind = 'full' | 'object'

export function clothPath(
  character: Character,
  id: string,
  kind: AssetKind,
): string {
  return `/assets/clothes/${character}-${id}-${kind}.png`
}

export const COIN_ICON_PATH = '/assets/ui/coin-icon.png'
export const CAPSULE_ICON_PATH = '/assets/ui/capsule-icon.png'
export const FITTING_ROOM_BG_PATH = '/assets/backgrounds/fitting-room.jpg'
