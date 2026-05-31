import type { ClothEntry, Grade } from './types'

// 웨딩(S+) 해금 스토리 옷 — rose(B) → vacation(A) → propose(S) 3벌.
// armed 게이트(3벌 전부 보유) 판정 및 도감 스토리 칩 표시에 쓰임.
export const STORY_CLOTH_IDS = ['rose', 'vacation', 'propose'] as const

// B 등급 (16벌) — 효과 없음, applyTo: 'idle' 강제.
export const CLOTHES_B: Record<string, ClothEntry> = {
  sprout: {
    id: 'sprout',
    name: '새싹 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '어느날 머리에서 새싹이 자라났다.',
  },
  oops: {
    id: 'oops',
    name: '웁스...',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '츄와와야, 안돼!',
  },
  glasses: {
    id: 'glasses',
    name: '또또기 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '어쩐지 똑똑해보인다!',
  },
  silky: {
    id: 'silky',
    name: '참기름 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '겨드랑이에는 엘라스틴을 하면 안 돼요',
  },
  silly: {
    id: 'silly',
    name: '바보 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '자신이 똑똑하다고 생각한다...',
  },
  snack: {
    id: 'snack',
    name: '야식 타임',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '먹다 남은 음식이다!',
  },
  muscle: {
    id: 'muscle',
    name: '근육 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '운동 많이 된다',
  },
  muddy: {
    id: 'muddy',
    name: '헥헥 산책조아',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '이따 목욕 당첨이다!',
  },
  collar: {
    id: 'collar',
    name: '산책 준비',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '1시간 째 기다리고 있다...',
  },
  shades: {
    id: 'shades',
    name: '멋쟁이 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '힙해졌다! ...그것 뿐이다',
  },
  rose: {
    id: 'rose',
    name: '꽃을 든 와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '오늘은 고백할테야!',
  }, // 웨딩 해금 조건의 B 단계 스토리 옷
  ribbon: {
    id: 'ribbon',
    name: '선물 배달 왔어요',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '내가 선물이야!',
  },
  popsicle: {
    id: 'popsicle',
    name: '와삭와삭',
    grade: 'B',
    pair: true,
    applyTo: 'idle',
    description: '시원해졌어~',
  }, // 첫 페어 옷
  copter: {
    id: 'copter',
    name: '대나무 헬리콥터',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '하늘을 날진 못한다',
  },
  party: {
    id: 'party',
    name: '파티 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '언제나 냐냐를 응원해!',
  }, // A→B 강등
  angry: {
    id: 'angry',
    name: '분노 츄와와',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
    description: '화를 참을 수 없다, 아르르륵!!!',
  }, // A→B 강등
}

// A 등급 (8벌) — 데이트 룩. 효과 1개. applyTo: 'idle'. 효과 4종 × 2벌 균형.
export const CLOTHES_A: Record<string, ClothEntry> = {
  thief: {
    id: 'thief',
    name: '도독이야!!!',
    grade: 'A',
    pair: true,
    applyTo: 'idle',
    description: '쥬인님, 전 도독이 되었습니다',
    effects: { chiSpeedMul: 1.3 },
  },
  vacation: {
    id: 'vacation',
    name: '야호, 휴가다!',
    grade: 'A',
    pair: true,
    applyTo: 'idle',
    description: '냐냐와 함께 바닷가로 놀러왔어!',
    effects: { catSpeedMul: 0.85 },
  }, // 웨딩 해금 조건의 A 단계 스토리 옷
  ascend: {
    id: 'ascend',
    name: '승천',
    grade: 'A',
    pair: true,
    applyTo: 'idle',
    description: '인터넷을 비추는 한 줄기의 빛 ☆',
    effects: { chiSpeedMul: 1.3 },
  },
  fallen: {
    id: 'fallen',
    name: '타락',
    grade: 'A',
    pair: true,
    applyTo: 'idle',
    description: '전파를 퍼트리는 중 ★',
    effects: { pigeonSpawnMul: 1.4 },
  },
  maid: {
    id: 'maid',
    name: '메이드 츄와와',
    grade: 'A',
    pair: false,
    applyTo: 'idle',
    description: '모에모에큥~♡',
    effects: { itemSpawnMul: 0.75 },
  },
  fanclub: {
    id: 'fanclub',
    name: '최고다, 냐냐짱!',
    grade: 'A',
    pair: false,
    applyTo: 'idle',
    description: '냐냐 팬클럽 1기 회장. 부원수 1명',
    effects: { pigeonSpawnMul: 1.4 },
  },
  santa: {
    id: 'santa',
    name: '산타 와라버지',
    grade: 'A',
    pair: true,
    applyTo: 'idle',
    description: '울어도 돼 사실 난 루돌프거든',
    effects: { itemSpawnMul: 0.75 },
  },
  bee: {
    id: 'bee',
    name: '윙윙!',
    grade: 'A',
    pair: true,
    applyTo: 'idle',
    description: '꽃밭으로 날아간다!',
    effects: { catSpeedMul: 0.85 },
  },
}

// S 등급 (2벌) — 페어 확정, 효과 무제한 조합, applyTo: 'all'.
export const CLOTHES_S: Record<string, ClothEntry> = {
  propose: {
    id: 'propose',
    name: '프로포즈',
    grade: 'S',
    pair: true,
    applyTo: 'all',
    description: '나랑 결혼해줄래?',
    effects: {
      catSpeedMul: 0.7,
      pigeonSpawnMul: 1.7,
    },
    kissingAsset: true,
    endingId: 'propose',
  }, // 웨딩 해금 조건의 S 단계 스토리 옷 + 전용 엔딩 컷신
  joseon: {
    id: 'joseon',
    name: '돌쇠와 마님',
    grade: 'S',
    pair: true,
    applyTo: 'all',
    description: '둘의 전생일수도?',
    effects: {
      chiSpeedMul: 1.5,
      pigeonSpawnMul: 1.7,
    },
  },
}

export const CLOTHES: Record<string, ClothEntry> = {
  ...CLOTHES_B,
  ...CLOTHES_A,
  ...CLOTHES_S,
}

export const CLOTHES_BY_GRADE: Record<Grade, string[]> = {
  B: Object.values(CLOTHES)
    .filter((c) => c.grade === 'B')
    .map((c) => c.id),
  A: Object.values(CLOTHES)
    .filter((c) => c.grade === 'A')
    .map((c) => c.id),
  S: Object.values(CLOTHES)
    .filter((c) => c.grade === 'S')
    .map((c) => c.id),
  'S+': Object.values(CLOTHES)
    .filter((c) => c.grade === 'S+')
    .map((c) => c.id),
}

export function clothesByGrade(grade: Grade): ClothEntry[] {
  return Object.values(CLOTHES).filter((c) => c.grade === grade)
}
