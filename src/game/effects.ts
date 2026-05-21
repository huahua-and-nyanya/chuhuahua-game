import {
  BOOST_DURATION,
  BOOST_MUL,
  CUCUMBER_DURATION,
  MEGA_MUL,
  SHIELD_DURATION,
  SWEETPOTATO_DURATION,
} from './constants'
import type { GameRefs } from './loop/state'
import type { PickerSide } from './state'

// === 속도 곱셈 헬퍼 (chi-input / cat-flee에서 매 프레임 호출) ===

// chi 측 속도 배율 — chiBoost 활성 시 1.55 (mega는 2.0). 비활성이면 1.
// (옷 효과 chiSpeedMul은 사이클 W에서 추가.)
export function getChiSpeedMul(refs: GameRefs, now: number): number {
  const boost = refs.effects.chiBoost
  if (boost.until > now) {
    return boost.mega ? MEGA_MUL : BOOST_MUL
  }
  return 1
}

// cat 측 lerp 배율 — catSlow가 우선, 없으면 catSpeedup, 둘 다 없으면 1.
// 솔로엔 catSlow/catSpeedup 자체가 안 발동(PvP 분기). 호환성을 위해 분기 보존.
const CUCUMBER_CAT_LERP_MULT = 1.85
const SWEETPOTATO_CAT_SLOW_MULT = 0.55

export function getCatSpeedMul(refs: GameRefs, now: number): number {
  if (refs.effects.catSlow.until > now) return SWEETPOTATO_CAT_SLOW_MULT
  if (refs.effects.catSpeedup.until > now) return CUCUMBER_CAT_LERP_MULT
  return 1
}

// === 효과 적용 헬퍼 ===
// 모든 effects 쓰기는 본 헬퍼를 경유한다 (충돌/픽업 모듈에서 직접 set 금지).

export function applyChiBoost(
  refs: GameRefs,
  now: number,
  duration: number,
  opts?: { mega?: boolean },
): void {
  refs.effects.chiBoost = {
    until: now + duration,
    mega: opts?.mega ?? false,
  }
}

export function applyCatShield(
  refs: GameRefs,
  now: number,
  duration: number,
): void {
  refs.effects.catShield = { until: now + duration }
}

// === 아이템 픽업별 효과 ===
// solo 단일 분기. PvP picker 분기는 사이클 F에서 추가.

// reference 1504: kibble → chiBoost 5초.
// reference 1499의 chiSlow 상쇄는 솔로에선 chiSlow 자체가 안 발동(PvP의 sweetPotato 한정)이라 dead branch.
export function applyKibbleEffect(refs: GameRefs, now: number): void {
  applyChiBoost(refs, now, BOOST_DURATION)
}

// reference 1533: 솔로 fish → cat에 쉴드 5초 (츄가 fish를 먹어 cat을 보호).
// picker는 PvP 분기용 자리만 남기고 솔로는 무시.
export function applyFishEffect(
  refs: GameRefs,
  now: number,
  picker: PickerSide,
): void {
  void picker
  applyCatShield(refs, now, SHIELD_DURATION)
}

// === 솔로엔 안 스폰되는 디버프 아이템 (PvP F에서 사용. 현재는 dead branch 자리) ===

// reference 1546: cucumber → catSpeedup (PvP에선 catSlow와 상쇄).
// 솔로엔 cucumber 자체가 안 스폰되므로 본 함수 호출되지 않음.
export function applyCucumberEffect(refs: GameRefs, now: number): void {
  refs.effects.catSpeedup = { until: now + CUCUMBER_DURATION }
}

// reference 2007: sweetPotato → picker쪽 슬로우 (PvP 한정).
// 솔로엔 sweetPotato 자체가 안 스폰되므로 본 함수 호출되지 않음.
export function applySweetPotatoEffect(
  refs: GameRefs,
  now: number,
  picker: PickerSide,
): void {
  if (picker === 'cat') {
    refs.effects.catSlow = { until: now + SWEETPOTATO_DURATION }
  } else {
    refs.effects.chiSlow = { until: now + SWEETPOTATO_DURATION }
  }
}
