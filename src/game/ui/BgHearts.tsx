import type { BgHeart } from '@/game/loop/state'

// 배경 부유 하트 12개 — zIndex 1로 배경 위, 캐릭터/아이템/HUD 아래.
// 위치/투명도는 initBgHearts에서 결정, updateBgHearts가 매 RAF 갱신.
// SVG path는 Particles의 HeartShape와 동일 (결정 옵션 1: 인라인 유지).
export type BgHeartsProps = {
  hearts: BgHeart[]
}

export function BgHearts({ hearts }: BgHeartsProps) {
  if (hearts.length === 0) return null
  return (
    <>
      {hearts.map((h) => (
        <div
          key={h.id}
          className="pointer-events-none absolute"
          style={{
            left: h.x,
            top: h.y,
            transform: 'translate(-50%, -50%)',
            opacity: h.opacity,
            zIndex: 1,
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill={h.color}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </>
  )
}
