import type { JSX } from 'react'
import { CHARACTER_ASSETS } from '@/assets'

// 쉴드 활성 시: cat 이미지를 catShield 변신 일러스트로 교체 + 푸른 글로우.
// 추가로 ShieldBubble을 별도 오버레이로 띄움 (게임 루프 책임).
// 원본 패턴 — reference/ChihuahuaCatKissGame.txt:464-472.
// 좌우 반전은 게임 루프(사이클 C)가 wrapper에서 scaleX(catFacing)로 처리.
interface CatProps {
  kissing?: boolean
  shielded?: boolean
  scared?: boolean
  angry?: boolean
  boosted?: boolean
  slowed?: boolean
  equippedSrc?: string
  // propose 코스튬 스토리 armed — 전 상태를 데이트룩 스프라이트로 교체. (글로우/버블은 그대로)
  armed?: boolean
  // propose 컷신(story) — 정장 스프라이트. kissing이면 입 가린 수줍, 아니면 idle full.
  story?: boolean
}

// 우선순위 (F-1.8 휘게 결정): kissing > angry > slowed > shielded > scared > equippedSrc > default
// reference 원본은 kissing > shielded > slowed > angry > scared 순이었으나, 분노/슬로우 매커니즘 활성 시
// 시각도 매커니즘 우선이 맞다는 결정으로 angry/slowed를 shielded 위로 이동.
// armed면 같은 우선순위로 데이트룩 풀세트 사용 (slowed는 솔로에서 고양이 미발생 → catDate 폴백).
// story(정장 컷신)는 armed보다 우선.
function pickSrc(props: CatProps): string {
  if (props.story) {
    return props.kissing
      ? CHARACTER_ASSETS.catProposeKissing
      : CHARACTER_ASSETS.catProposeFull
  }
  if (props.armed) {
    if (props.kissing) return CHARACTER_ASSETS.catDateKissing
    if (props.angry) return CHARACTER_ASSETS.catDateAngry
    if (props.shielded) return CHARACTER_ASSETS.catDateShield
    if (props.scared) return CHARACTER_ASSETS.catDateScared
    return CHARACTER_ASSETS.catDate
  }
  if (props.kissing) return CHARACTER_ASSETS.catKissing
  if (props.angry) return CHARACTER_ASSETS.catAngry
  if (props.slowed) return CHARACTER_ASSETS.catSlow
  if (props.shielded) return CHARACTER_ASSETS.catShield
  if (props.scared) return CHARACTER_ASSETS.catScared
  if (props.equippedSrc) return props.equippedSrc
  return CHARACTER_ASSETS.cat
}

// 효과별 통일 비율: 약(kissing) ×1.05 / 강(angry, slowed, shielded) ×1.10
// F-1.8: pickSrc 우선순위와 동일 순서로 size 분기 재배치. 강효과 3종은 같은 SIZE_STRONG이라 결과 동일.
const SIZE_BASE = 120
const SIZE_SOFT = 126
const SIZE_STRONG = 132

function pickSize(props: CatProps): number {
  if (props.kissing) return SIZE_SOFT
  if (props.angry || props.slowed || props.shielded) return SIZE_STRONG
  return SIZE_BASE
}

function pickFilter(props: CatProps): string {
  if (props.kissing)
    return 'brightness(1.15) drop-shadow(0 0 8px rgba(255, 61, 127, 0.9))'
  if (props.angry)
    return 'brightness(1.05) drop-shadow(0 0 8px rgba(120, 200, 50, 0.85))'
  if (props.slowed)
    return 'drop-shadow(0 0 8px rgba(160, 90, 58, 0.85)) drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
  if (props.shielded)
    return 'brightness(1.05) drop-shadow(0 0 8px rgba(93, 173, 226, 0.9))'
  if (props.boosted)
    return 'brightness(1.1) drop-shadow(0 0 10px rgba(255, 140, 0, 0.9))'
  if (props.scared) return 'drop-shadow(0 0 6px rgba(255, 50, 50, 0.6))'
  return 'drop-shadow(2px 2px 0 rgba(0,0,0,0.15))'
}

export function Cat(props: CatProps): JSX.Element {
  const size = pickSize(props)
  return (
    <img
      src={pickSrc(props)}
      alt=""
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
        filter: pickFilter(props),
        transition: 'filter 0.2s ease, width 0.2s ease, height 0.2s ease',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
