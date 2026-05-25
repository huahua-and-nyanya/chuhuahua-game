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

// === floatText 색상 / 지속시간 (F-1.6 effect-side 인스트루먼테이션) ===
// FloatText.tsx FLOAT_LIFETIME 800ms과 일치. 별도 토큰 신설 없음.
const EFFECT_FLOAT_LIFETIME = 800 // ms
// 신규 슬로우 받음 (sweetPotato 디버프 부여). 기존 고구마색 (reference '#a05a3a').
const EFFECT_SLOW_COLOR = '#a05a3a'
// 슬로우 → 회복 상쇄 (kibble/cucumber 픽업으로 슬로우 해제). TOKEN.primary 핑크.
const EFFECT_HEAL_COLOR = 'var(--color-pink-700)'
// 부스트 → 디버프로 상쇄 (sweetPotato 픽업으로 부스트 해제). 신규 hex, 토큰 신설 X.
const EFFECT_BOOST_CANCEL_COLOR = '#3a4a7a'

// Y 오프셋 — 캐릭터 머리 위 ~20px (reference 동일).
const FLOAT_Y_OFFSET = 20

function pushEffectFloat(
  refs: GameRefs,
  now: number,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  refs.floatTexts.push({
    id: now + Math.random(),
    text,
    x,
    y,
    color,
    until: now + EFFECT_FLOAT_LIFETIME,
  })
}

// === 속도 곱셈 헬퍼 (chi-input / cat-flee에서 매 프레임 호출) ===

// reference 1623/1656: 디버프 속도 배율.
const CUCUMBER_CAT_LERP_MULT = 1.85 // cucumber → cat 도망 1.85배
const SWEETPOTATO_CHI_SLOW_MULT = 0.55 // sweetPotato → 슬로우 측 속도 55%

// chi 측 속도 배율 — chiSlow가 우선(고구마 디버프 0.55), chiBoost(1.55/mega 2.0), 그 외 1.
// (옷 효과 chiSpeedMul은 사이클 W에서 추가.)
export function getChiSpeedMul(refs: GameRefs, now: number): number {
  if (refs.effects.chiSlow.until > now) return SWEETPOTATO_CHI_SLOW_MULT
  const boost = refs.effects.chiBoost
  if (boost.until > now) {
    return boost.mega ? MEGA_MUL : BOOST_MUL
  }
  return 1
}

// cat 측 lerp 배율 — catSlow가 우선(고구마 PvP), 없으면 catSpeedup(오이 1.85), 둘 다 없으면 1.

export function getCatSpeedMul(refs: GameRefs, now: number): number {
  if (refs.effects.catSlow.until > now) return SWEETPOTATO_CHI_SLOW_MULT
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

// PvP에서 chi가 fish 픽업 시 부여 — sweetPotato 디버프 1회 차단 (소진).
export function applyChiShield(
  refs: GameRefs,
  now: number,
  duration: number,
): void {
  refs.effects.chiShield = { until: now + duration }
}

// === 아이템 픽업별 효과 ===
// solo 단일 분기. PvP picker 분기는 사이클 F에서 추가.
// 반환값: true = 기존 반대 효과와 상쇄됨(새 효과 부여 X), false = 새 효과 부여.

// reference 1499~1508: kibble → chiSlow 활성 시 상쇄, 아니면 chiBoost 5초.
// Q2 (F-1.6): chiSlow 상쇄 시 "야호!" 핑크 floatText 츄 머리 위에 추가.
export function applyKibbleEffect(refs: GameRefs, now: number): boolean {
  if (refs.effects.chiSlow.until > now) {
    refs.effects.chiSlow = { until: 0 }
    pushEffectFloat(
      refs,
      now,
      '야호!',
      refs.chi.x,
      refs.chi.y - FLOAT_Y_OFFSET,
      EFFECT_HEAL_COLOR,
    )
    return true
  }
  applyChiBoost(refs, now, BOOST_DURATION)
  return false
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

// reference 1541~1547: cucumber → catSlow 활성 시 상쇄, 아니면 catSpeedup.
// Q2 (F-1.6): catSlow 상쇄 시 "야호!" 핑크 floatText 냐 머리 위에 추가.
// 솔로엔 cucumber가 스폰되지 않지만 picker 분기 없이 cat 기준만 적용 (cucumber는 PvP cat 전용 픽업).
// 반환값: true = catSlow 상쇄 / false = catSpeedup 부여.
export function applyCucumberEffect(refs: GameRefs, now: number): boolean {
  if (refs.effects.catSlow.until > now) {
    refs.effects.catSlow = { until: 0 }
    pushEffectFloat(
      refs,
      now,
      '야호!',
      refs.cat.x,
      refs.cat.y - FLOAT_Y_OFFSET,
      EFFECT_HEAL_COLOR,
    )
    return true
  }
  refs.effects.catSpeedup = { until: now + CUCUMBER_DURATION }
  return false
}

// reference 1550~1568: sweetPotato → 먹은 쪽 부스트 활성 시 상쇄, 아니면 슬로우 부여.
// 솔로 picker는 항상 'chi'. PvP 'cat' 분기는 사이클 F에서 동일 패턴.
// Q1 (F-1.6): 신규 슬로우 부여(부스트 비활성) 시 "펑!" 갈색 floatText 픽업 측 머리 위에 추가.
// Q3 (F-1.6): 부스트 상쇄(chiBoost/catSpeedup 해제) 시 "힝..." 남색 floatText 픽업 측 머리 위에 추가.
export function applySweetPotatoEffect(
  refs: GameRefs,
  now: number,
  picker: PickerSide,
): boolean {
  if (picker === 'cat') {
    if (refs.effects.catSpeedup.until > now) {
      refs.effects.catSpeedup = { until: 0 }
      pushEffectFloat(
        refs,
        now,
        '힝...',
        refs.cat.x,
        refs.cat.y - FLOAT_Y_OFFSET,
        EFFECT_BOOST_CANCEL_COLOR,
      )
      return true
    }
    refs.effects.catSlow = { until: now + SWEETPOTATO_DURATION }
    pushEffectFloat(
      refs,
      now,
      '펑!',
      refs.cat.x,
      refs.cat.y - FLOAT_Y_OFFSET,
      EFFECT_SLOW_COLOR,
    )
    return false
  }
  if (refs.effects.chiBoost.until > now) {
    refs.effects.chiBoost = { until: 0 }
    pushEffectFloat(
      refs,
      now,
      '힝...',
      refs.chi.x,
      refs.chi.y - FLOAT_Y_OFFSET,
      EFFECT_BOOST_CANCEL_COLOR,
    )
    return true
  }
  refs.effects.chiSlow = { until: now + SWEETPOTATO_DURATION }
  pushEffectFloat(
    refs,
    now,
    '펑!',
    refs.chi.x,
    refs.chi.y - FLOAT_Y_OFFSET,
    EFFECT_SLOW_COLOR,
  )
  return false
}
