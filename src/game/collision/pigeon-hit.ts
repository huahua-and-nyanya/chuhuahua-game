import { PIGEON_HIT_DIST, PIGEON_SCARE_DIST } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'

// reference 1831~1899 솔로 분기 + C-3.5 보강. 우선순위:
//   1) chi 차단 (SCARE_DIST 60 내) → fleeing 전환 + 푸시 ×9 + onPigeonBlock(+1점).
//   2) 쉴드 차단 (HIT_DIST 30 + catShield 활성) → fleeing 전환 + 푸시 ×11 + onShieldBlock(+1점).
//      catShield는 해제하지 않고 지속 시간 동안 유지 (reference 1869~1893 정확 일치).
//   3) 뽀뽀 차단 (HIT_DIST 30 + 뽀뽀 무적) → fleeing 전환 + 푸시 ×10 + onShieldBlock(+1점).
//      C-3.5 추가 — reference엔 없으나 뽀뽀 중 비둘기를 능동적으로 밀어내는 게임 의도.
//   4) 냐냐 직격 (위 셋 모두 미해당) → onCatHit (게임오버).

// 푸시 강도 — 츄 9 < 뽀뽀 10 < 쉴드 11 차등.
const CHI_BLOCK_PUSH = 9
const KISS_BLOCK_PUSH = 10
const SHIELD_BLOCK_PUSH = 11
// 위로 살짝 띄우는 보정 (reference 1841: -2).
const VERTICAL_LIFT = 2

export type PigeonHitDeps = {
  refs: GameRefs
  now: number
  onCatHit: () => void
  onPigeonBlock: () => void
  onShieldBlock: () => void
}

export function checkPigeonHits(deps: PigeonHitDeps): void {
  const { refs, now, onCatHit, onPigeonBlock, onShieldBlock } = deps
  const chi = refs.chi
  const cat = refs.cat
  const kissInvuln = refs.kissing.active && refs.kissing.until > now
  const catShielded = refs.effects.catShield.until > now

  for (let i = refs.pigeons.length - 1; i >= 0; i--) {
    const p = refs.pigeons[i]
    if (p.state !== 'flying') continue

    // 1순위: 츄 차단.
    const dxc = p.x - chi.x
    const dyc = p.y - chi.y
    const dc = Math.hypot(dxc, dyc)
    if (dc < PIGEON_SCARE_DIST) {
      const len = dc || 1
      p.vx = (dxc / len) * CHI_BLOCK_PUSH
      p.vy = (dyc / len) * CHI_BLOCK_PUSH - VERTICAL_LIFT
      p.state = 'fleeing'
      onPigeonBlock()
      continue
    }

    // 2~4순위: cat-pigeon 거리 검사.
    const dxk = p.x - cat.x
    const dyk = p.y - cat.y
    const dkp = Math.hypot(dxk, dyk)
    if (dkp >= PIGEON_HIT_DIST) continue
    const len = dkp || 1
    const nx = dxk / len
    const ny = dyk / len

    // 2순위: 쉴드 차단 — fleeing + 푸시 ×11, 쉴드 유지.
    if (catShielded) {
      p.vx = nx * SHIELD_BLOCK_PUSH
      p.vy = ny * SHIELD_BLOCK_PUSH - VERTICAL_LIFT
      p.state = 'fleeing'
      onShieldBlock()
      continue
    }

    // 3순위: 뽀뽀 차단 — fleeing + 푸시 ×10, +1점.
    if (kissInvuln) {
      p.vx = nx * KISS_BLOCK_PUSH
      p.vy = ny * KISS_BLOCK_PUSH - VERTICAL_LIFT
      p.state = 'fleeing'
      onShieldBlock()
      continue
    }

    // 4순위: 직격 → 게임오버.
    onCatHit()
    return
  }
}
