import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'

interface PigeonProps {
  fleeing?: boolean
  // 진행 방향 — 머리/몸 회전 계산용. 정지(둘 다 0)면 원본 자세 유지.
  vx?: number
  vy?: number
}

// 원본 자산은 오른쪽 향함. 진행 방향 angle = atan2(vy, vx) 그대로 적용해
// 상하 비행 시 정확히 ±90도 세로 회전. 좌측 진행은 좌우 반전 후 angle - 180.
// reference 2540~2552 패턴 (transform 순서: rotate → scaleX, 적용은 scaleX → rotate 순).
export function Pigeon({ fleeing, vx = 0, vy = 0 }: PigeonProps): JSX.Element {
  const flip = vx < 0
  const angle = (Math.atan2(vy, vx) * 180) / Math.PI
  const renderAngle = flip ? angle - 180 : angle
  const transform = flip
    ? `rotate(${renderAngle}deg) scaleX(-1)`
    : `rotate(${renderAngle}deg)`
  return (
    <img
      src={CHARACTER_ASSETS.pigeon}
      alt=""
      draggable={false}
      style={{
        width: 105,
        height: 90,
        objectFit: 'contain',
        flexShrink: 0,
        filter: fleeing
          ? 'grayscale(0.5) opacity(0.8)'
          : 'drop-shadow(0 0 4px rgba(255, 50, 50, 0.4))',
        transform,
        transition: 'transform 0.15s ease-out, filter 0.2s ease',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
