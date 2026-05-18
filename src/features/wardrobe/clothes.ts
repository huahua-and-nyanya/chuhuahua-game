import type { ApplyTo, ClothEffects, Grade } from './grades'

export type ClothEntry = {
  id: string
  name: string
  grade: Grade
  pair: boolean
  applyTo: ApplyTo
  effects?: ClothEffects
}

export const CLOTHES: Record<string, ClothEntry> = {
  // 옷 항목은 자산 박은 후 휘게가 직접 추가
  // 등록 방법: docs/wardrobe-extension.md 참조
  //
  // 예시 템플릿 (자산 박은 후 주석 풀어 사용):
  // sprout: {
  //   id: 'sprout',
  //   name: '새싹',
  //   grade: 'B',
  //   pair: false,
  //   applyTo: 'idle',
  // },
}

export function clothesByGrade(grade: Grade): ClothEntry[] {
  return Object.values(CLOTHES).filter((c) => c.grade === grade)
}
