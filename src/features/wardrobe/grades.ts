export type Grade = 'B' | 'A' | 'S' | 'S+'
export type ApplyTo = 'idle' | 'all'

export type ClothEffects = {
  chiSpeedMul?: number
  catSpeedMul?: number
  pigeonSpawnMul?: number
  itemSpawnMul?: number
  pigeonDisabled?: boolean
  backgroundOverride?: string
  triggerEnding?: string
}

export const GRADE_POLICY = {
  B: { label: 'Common', maxEffects: 0, allowedFields: [] },
  A: {
    label: 'Rare',
    maxEffects: 1,
    allowedFields: [
      'chiSpeedMul',
      'catSpeedMul',
      'pigeonSpawnMul',
      'itemSpawnMul',
    ],
  },
  S: {
    label: 'Epic',
    maxEffects: Infinity,
    allowedFields: [
      'chiSpeedMul',
      'catSpeedMul',
      'pigeonSpawnMul',
      'itemSpawnMul',
    ],
  },
  'S+': {
    label: 'Legendary',
    maxEffects: Infinity,
    allowedFields: [
      'chiSpeedMul',
      'catSpeedMul',
      'pigeonDisabled',
      'backgroundOverride',
      'triggerEnding',
    ],
  },
} as const

export const GRADE_WEIGHT = {
  B: 60,
  A: 30,
  S: 9,
  'S+': 1,
} as const

export const PAIR_WEIGHT_MULTIPLIER = 0.7

export function validateClothEffects(
  grade: Grade,
  effects?: ClothEffects,
): string[] {
  const violations: string[] = []
  if (!effects) return violations
  const policy = GRADE_POLICY[grade]
  const effectKeys = Object.keys(effects)
  if (policy.maxEffects !== Infinity && effectKeys.length > policy.maxEffects) {
    violations.push(
      `${grade} 등급은 효과 ${policy.maxEffects}개 이하만 허용 (현재 ${effectKeys.length}개)`,
    )
  }
  for (const key of effectKeys) {
    if (!(policy.allowedFields as readonly string[]).includes(key)) {
      violations.push(`${grade} 등급은 '${key}' 필드 사용 불가`)
    }
  }
  return violations
}
