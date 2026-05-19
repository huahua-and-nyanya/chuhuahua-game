import {
  BOOST_DURATION,
  CUCUMBER_DURATION,
  SHIELD_DURATION,
  SWEETPOTATO_DURATION,
} from './constants'
import type { EffectState, PickerSide, TimedEffect } from './state'

export type EffectMode = 'solo' | 'pvp'

export interface ApplyEffectContext {
  mode: EffectMode
  now: number // Date.now() 주입 (테스트 친화)
  state: EffectState
}

export type EffectResult =
  | { kind: 'applied'; effect: string }
  | { kind: 'cancelled'; pair: string }
  | { kind: 'noop' }

function isActive(effect: TimedEffect | null, now: number): boolean {
  return effect !== null && effect.until > now
}

// === kibble: 츄와 부스트 (chiSlow와 상쇄) ===

export function applyKibbleEffect(ctx: ApplyEffectContext): EffectResult {
  const { state, now } = ctx
  if (isActive(state.chiSlow, now)) {
    state.chiSlow = null
    return { kind: 'cancelled', pair: 'chiSlow' }
  }
  state.chiBoost = { until: now + BOOST_DURATION }
  return { kind: 'applied', effect: 'chiBoost' }
}

// === fish: 솔로 = 고양이 쉴드 / PvP = picker쪽 쉴드 (picker쪽 slow와 상쇄, 쉴드 부여 X) ===

export function applyFishEffect(
  picker: PickerSide,
  ctx: ApplyEffectContext,
): EffectResult {
  const { mode, state, now } = ctx
  if (mode === 'solo') {
    state.catShield = { until: now + SHIELD_DURATION }
    return { kind: 'applied', effect: 'catShield' }
  }
  if (picker === 'chi') {
    if (isActive(state.chiSlow, now)) {
      state.chiSlow = null
      return { kind: 'cancelled', pair: 'chiSlow' }
    }
    state.chiShield = { until: now + SHIELD_DURATION }
    return { kind: 'applied', effect: 'chiShield' }
  }
  if (isActive(state.catSlow, now)) {
    state.catSlow = null
    return { kind: 'cancelled', pair: 'catSlow' }
  }
  state.catShield = { until: now + SHIELD_DURATION }
  return { kind: 'applied', effect: 'catShield' }
}

// === cucumber: 고양이 가속 (catSlow와 상쇄). 솔로/PvP 모두 동일 가드 ===

export function applyCucumberEffect(ctx: ApplyEffectContext): EffectResult {
  const { state, now } = ctx
  if (isActive(state.catSlow, now)) {
    state.catSlow = null
    return { kind: 'cancelled', pair: 'catSlow' }
  }
  state.catSpeedup = { until: now + CUCUMBER_DURATION }
  return { kind: 'applied', effect: 'catSpeedup' }
}

// === sweetPotato: picker쪽 슬로우 (picker쪽 가속 효과와 상쇄) ===
// 솔로에서는 picker='chi'만 호출됨 (호출 측 책임)

export function applySweetPotatoEffect(
  picker: PickerSide,
  ctx: ApplyEffectContext,
): EffectResult {
  const { state, now } = ctx
  if (picker === 'cat') {
    if (isActive(state.catSpeedup, now)) {
      state.catSpeedup = null
      return { kind: 'cancelled', pair: 'catSpeedup' }
    }
    state.catSlow = { until: now + SWEETPOTATO_DURATION }
    return { kind: 'applied', effect: 'catSlow' }
  }
  if (isActive(state.chiBoost, now)) {
    state.chiBoost = null
    return { kind: 'cancelled', pair: 'chiBoost' }
  }
  state.chiSlow = { until: now + SWEETPOTATO_DURATION }
  return { kind: 'applied', effect: 'chiSlow' }
}
