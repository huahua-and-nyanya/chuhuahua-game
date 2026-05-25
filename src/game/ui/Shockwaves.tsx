import type { ShockwaveRef } from '@/game/state'

// 비둘기 차단 시 충돌 지점에 작은 흰 ring → CSS keyframe shockwave-expand로 0.3s 확장.
// 위치 고정 — refs에서 좌표 받아 그대로 렌더. 만료는 expireTransients에서 splice.
// zIndex 7 — 캐릭터/아이템(기본 z)과 FloatText(9)/Mwah(10) 사이.

export type ShockwavesProps = {
  items: ShockwaveRef[]
}

export function Shockwaves({ items }: ShockwavesProps) {
  if (items.length === 0) return null
  return (
    <>
      {items.map((s) => (
        <div
          key={s.id}
          className="animate-shockwave-expand pointer-events-none absolute z-7 h-2 w-2 rounded-full border-2 border-solid border-[rgba(255,255,255,0.85)]"
          style={{ left: s.x, top: s.y }}
        />
      ))}
    </>
  )
}
