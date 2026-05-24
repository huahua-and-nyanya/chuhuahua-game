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
          className="pointer-events-none absolute rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: 8,
            height: 8,
            border: '2px solid rgba(255, 255, 255, 0.85)',
            animation: 'shockwave-expand 0.3s ease-out forwards',
            zIndex: 7,
          }}
        />
      ))}
    </>
  )
}
