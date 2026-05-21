import { PIGEON_HIT_DIST, PIGEON_SCARE_DIST } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'

// reference 1831~1899 솔로 분기 이식. 우선순위:
//   1) chi 차단 (SCARE_DIST 60 내) → 비둘기 fleeing 전환, +1점.
//   2) 쉴드 차단 (HIT_DIST 30 내 + catShield 활성) → 비둘기 제거 + 쉴드 1회 소진, +1점.
//      ⚠️ reference 1869~1893는 쉴드 무한 유지 + fleeing 강푸시지만,
//      C-3' 위임 결정 사실은 "쉴드 1회 소진 + 비둘기 제거" — 명세 따름.
//   3) 냐냐 직격 (HIT_DIST 30 + 쉴드 X + 뽀뽀 무적 X) → onCatHit (게임오버).

const BLOCK_PUSH = 9 // px/frame, chi 차단 시 비둘기에 부여하는 푸시 속도

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

    // 1순위: chi 차단 — 츄가 SCARE_DIST(60) 안에 들어오면 비둘기 fleeing 전환.
    const dxc = p.x - chi.x
    const dyc = p.y - chi.y
    const dc = Math.hypot(dxc, dyc)
    if (dc < PIGEON_SCARE_DIST) {
      const len = dc || 1
      const nxs = dxc / len
      const nys = dyc / len
      p.vx = nxs * BLOCK_PUSH
      p.vy = nys * BLOCK_PUSH - 2
      p.state = 'fleeing'
      onPigeonBlock()
      continue
    }

    // 2순위 / 3순위: cat-pigeon 거리 검사.
    const dxk = p.x - cat.x
    const dyk = p.y - cat.y
    const dkp = Math.hypot(dxk, dyk)
    if (dkp >= PIGEON_HIT_DIST) continue

    // 2순위: 쉴드 차단 → 비둘기 제거 + 쉴드 해제.
    if (catShielded) {
      refs.pigeons.splice(i, 1)
      refs.effects.catShield = { until: 0 }
      onShieldBlock()
      continue
    }

    // 3순위: 뽀뽀 중이면 직격 무적 (한 프레임 가드).
    if (kissInvuln) continue

    // 직격 — 게임오버. 더 이상 처리 X.
    onCatHit()
    return
  }
}
