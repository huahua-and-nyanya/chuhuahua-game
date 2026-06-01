export const CHARACTER_ASSETS = {
  chihuahua: '/assets/characters/chihuahua.png',
  chihuahuaKissing: '/assets/characters/chihuahua-kissing.png',
  chihuahuaSlow: '/assets/characters/chihuahua-slow.png',
  chihuahuaSad: '/assets/characters/chihuahua-sad.png',
  chihuahuaVictory: '/assets/characters/chihuahua-victory.png',
  chihuahuaSleep: '/assets/characters/chihuahuaSleep.png',
  chihuahuaReceipt: '/assets/characters/chihuahua-receipt.png',
  withSleep: '/assets/characters/withSleep.png',
  cat: '/assets/characters/cat.png',
  catKissing: '/assets/characters/cat-kissing.png',
  catAngry: '/assets/characters/cat-angry.png',
  catScared: '/assets/characters/cat-scared.png',
  catSlow: '/assets/characters/cat-slow.png',
  catShield: '/assets/characters/cat-shield.png',
  catVictory: '/assets/characters/cat-victory.png',
  pigeon: '/assets/characters/pigeon.png',

  // ── propose 코스튬 스토리 (W 사이클) ──────────────────────────────
  // 데이트룩(armed 한 판): LV1~9 동안 츄/냐 둘 다 교체. 솔로 도달 상태만 제작.
  // (cat-date-slow 없음 — 솔로 고구마는 츄만 슬로우)
  chiDate: '/assets/characters/chi-date.png',
  chiDateKissing: '/assets/characters/chi-date-kissing.png',
  chiDateSlow: '/assets/characters/chi-date-slow.png',
  catDate: '/assets/characters/cat-date.png',
  catDateKissing: '/assets/characters/cat-date-kissing.png',
  catDateAngry: '/assets/characters/cat-date-angry.png',
  catDateScared: '/assets/characters/cat-date-scared.png',
  catDateShield: '/assets/characters/cat-date-shield.png',

  // propose 정장 컷신(S2 사용, 키만 등록). 실 자산은 clothes/에 배치돼 있어
  // STORY_ASSETS.md §B의 characters/ 표기와 다름 — 실 자산 경로 기준으로 매핑.
  // armed 아닐 때 default 외형은 옷 시스템 clothPath('chi','propose','full')가 같은 파일을 가리킨다.
  chiProposeFull: '/assets/clothes/chi-propose-full.png',
  chiProposeKissing: '/assets/clothes/chi-propose-kissing.png',
  catProposeFull: '/assets/clothes/cat-propose-full.png',
  catProposeKissing: '/assets/clothes/cat-propose-kissing.png',

  // 웨딩(S+) — 키만 등록(다음 브랜치 전용 컷신용). idle 외형은 옷 시스템
  // clothPath('chi'/'cat','wedding','full')가 같은 파일을 가리켜 자동 동작.
  // kissing은 S3 플레이 미연결(applyTo idle → kissing은 베이스 폴백).
  chiWeddingFull: '/assets/clothes/chi-wedding-full.png',
  chiWeddingKissing: '/assets/clothes/chi-wedding-kissing.png',
  chiWeddingSlow: '/assets/clothes/chi-wedding-slow.png',
  catWeddingFull: '/assets/clothes/cat-wedding-full.png',
  catWeddingKissing: '/assets/clothes/cat-wedding-kissing.png',
  catWeddingAngry: '/assets/clothes/cat-wedding-angry.png',
  catWeddingScared: '/assets/clothes/cat-wedding-scared.png',
  catWeddingShield: '/assets/clothes/cat-wedding-shield.png',
} as const
