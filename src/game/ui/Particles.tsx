import type { ParticleRef } from '@/game/state'

// 하트 파티클 — kiss 4~6개 폭발 + levelUp 18개 burst.
// 위치/회전은 particles.ts updateParticles가 매 RAF 갱신. 본 컴포넌트는 표시만.
// 색상은 동적 다양성 위해 hex 직접 (스타일 정책 예외 — kiss/levelUp 사이클별 색상 팔레트).

export type ParticlesProps = {
  particles: ParticleRef[]
}

export function Particles({ particles }: ParticlesProps) {
  if (particles.length === 0) return null
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute"
          style={{
            left: p.x,
            top: p.y,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            opacity: Math.min(1, p.life / 16),
            zIndex: 8,
          }}
        >
          <HeartShape size={p.size} color={p.color} />
        </div>
      ))}
    </>
  )
}

function HeartShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}
