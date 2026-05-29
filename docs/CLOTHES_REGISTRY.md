# CLOTHES_REGISTRY.md — 옷 등록 진실 공급원 (Claude Code용)

> 사이클 W 진입 시 `src/features/wardrobe/clothes.ts` 작성의 기반 자료.
> 형님이 컨셉 결정한 옷 메타 누적 등록.

## 갱신 이력

- **v1** (2026-05-29): B 등급 14개 등록 + A 등급 1개 (thief)
- **v2** (2026-05-29): A 등급 8벌 확정. `thief` 단일→페어 변경. `party`/`angry` A→B 강등. A 스토리 옷 = `vacation` 확정. 효과 4종×2벌 균형.
- **v3** (2026-05-30): S 등급 진입 — 컨셉 상견례→**프로포즈** 변경. `propose` 등록 (페어, `catSpeedMul:0.7`+`pigeonSpawnMul:1.7`, S 스토리 옷). S 자산 규약 신설 (idle+kissing, 옷당 5장). `propose` 전용 엔딩 컷신 (`ENDING_SPEC.md`). ClothEntry에 `kissingAsset`/`endingId` 필드 추가 예정.
- **v4** (2026-05-30): 웨딩 해금 조건 전면 개편 — `proposeEndingCleared === true` 단일 조건으로 통일. 완주 횟수/보유 벌수/스토리 옷 보유 조건 폐기. 힌트 문구 확정.
- **v5** (2026-05-30): S 등급 `joseon`(돌쇠와 마님) 추가. kissingAsset 규약 옵션 B 확정 (엔딩 있는 옷만 kissing 자산). S 자산 규약 갱신.

---

## 등급별 효과 표준 수치 (사이클 W 결정)

옷마다 효과 수치를 따로 정하지 않고, **등급별로 통일된 수치** 사용. 형님 결정 사항.

### A 등급 효과 표준

A 등급은 효과 1개 부여 가능. 같은 효과 종류면 모든 A 옷에서 동일 수치.

| 효과 키 | 수치 | 형님 용어 | 의미 |
|---|---|---|---|
| `chiSpeedMul` | **1.3** | "속도" / "츄 빠르게" | 츄 30% 빠르게 |
| `catSpeedMul` | **0.85** | "냐냐 느리게" / "추적" | 냐 15% 느리게 |
| `pigeonSpawnMul` | **1.4** | "비둘기 적게" / "안전" | 비둘기 등장 간격 40% 길게 |
| `itemSpawnMul` | **0.75** | "아이템 많이" / "운" | 아이템 등장 간격 25% 짧게 |

### S 등급 효과 표준

S 등급은 효과 무제한 + 페어 확정. 같은 효과 종류면 A보다 강한 수치.

| 효과 키 | 수치 | 형님 용어 | 의미 |
|---|---|---|---|
| `chiSpeedMul` | **1.5** | "속도" | 츄 50% 빠르게 |
| `catSpeedMul` | **0.7** | "냐냐 느리게" / "추적" | 냐 30% 느리게 |
| `pigeonSpawnMul` | **1.7** | "비둘기 적게" / "안전" | 비둘기 등장 간격 70% 길게 |
| `itemSpawnMul` | **0.6** | "아이템 많이" / "운" | 아이템 등장 간격 40% 짧게 |

S 등급은 위 효과 여러 개 조합 가능 (`chiSpeedMul: 1.5 + pigeonSpawnMul: 1.7` 등).

### S+ 등급 효과 표준

S+ 등급은 게임 변형 효과가 주. 일반 능력치(`chiSpeedMul` 등)는 옷별 결정. 게임 변형 필드:
- `pigeonDisabled: true`
- `backgroundOverride: '<bg-key>'`
- `triggerEnding: '<ending-id>'`

---

## 메타 인터페이스 (ClothEntry)

```ts
export type ClothEntry = {
  id: string
  name: string
  grade: Grade        // 'B' | 'A' | 'S' | 'S+'
  pair: boolean
  applyTo: ApplyTo    // B/A = 'idle', S/S+ = 'all'
  effects?: ClothEffects
  description?: string
}
```

---

## 등급별 옷 매핑 (가챠 풀 결정용)

```ts
export const CLOTHES_BY_GRADE = {
  B: Object.values(CLOTHES).filter(c => c.grade === 'B').map(c => c.id),
  A: Object.values(CLOTHES).filter(c => c.grade === 'A').map(c => c.id),
  S: Object.values(CLOTHES).filter(c => c.grade === 'S').map(c => c.id),
  'S+': Object.values(CLOTHES).filter(c => c.grade === 'S+').map(c => c.id),
}
```

---

## 스토리 진행도 옷 (웨딩 해금 조건)

웨딩 코스튬 (S+)은 **`propose` 착용 후 솔로 LV10 도달 → 엔딩 씬 시청** 으로만 해금.
기존 완주 횟수/보유 벌수/각 등급 스토리 옷 보유 조건 전부 폐기.

| 등급 | 스토리 옷 id | 이름 | 의미 |
|---|---|---|---|
| B | `rose` | 꽃을 든 와와 | 마음 결심 |
| A | `vacation` | 야호, 휴가다! | 데이트 시도 |
| S | `propose` | 프로포즈 | 관계 공식화 |
| S+ | `wedding` (자체) | 웨딩 | 결혼 |

> 스토리 옷들은 가챠를 통해 B→A→S 순으로 자연스럽게 수집됨. 별도 보유 조건 없음.

### 해금 조건 (단일)

```
chuhuahua:play-stats.proposeEndingCleared === true
```

`propose` 착용 → 솔로 플레이 → LV10 도달 → 엔딩 씬 재생 완료 시 `true` 로 기록.
이후 가챠 풀에 `wedding` 추가.

### 해금 힌트 문구 (UI 표시용)

```
꽃 한 송이를 내밀고,
함께 바다를 걸었다면,
이제 마지막으로 물어볼 것이 남았다.
```

---

## B 등급 (16개)

> 원래 14벌. A에서 강등된 `party`, `angry` 추가로 16벌.
> B 등급은 효과 없음, `applyTo: 'idle'` 강제.

### 메타 표

| # | id | 이름 | 설명 | 페어 | 자산 | 비고 |
|---|---|---|---|---|---|---|
| 1 | `sprout` | 새싹 츄와와 | 어느날 머리에서 새싹이 자라났다. | false | 2 | |
| 2 | `oops` | 웁스... | 츄와와야, 안돼! | false | 2 | |
| 3 | `glasses` | 또또기 츄와와 | 어쩐지 똑똑해보인다! | false | 2 | |
| 4 | `silky` | 참기름 츄와와 | 겨드랑이에는 엘라스틴을 하면 안 돼요 | false | 2 | |
| 5 | `silly` | 바보 츄와와 | 자신이 똑똑하다고 생각한다... | false | 2 | |
| 6 | `snack` | 야식 타임 | 먹다 남은 음식이다! | false | 2 | |
| 7 | `muscle` | 근육 츄와와 | 운동 많이 된다 | false | 2 | |
| 8 | `muddy` | 헥헥 산책조아 | 이따 목욕 당첨이다! | false | 2 | |
| 9 | `collar` | 산책 준비 | 1시간 째 기다리고 있다... | false | 2 | |
| 10 | `shades` | 멋쟁이 츄와와 | 힙해졌다! ...그것 뿐이다 | false | 2 | ⚠️ 검정 배경 |
| 11 | `rose` | 꽃을 든 와와 | 오늘은 고백할테야! | false | 2 | ⚠️ 검정 배경 + 🎀 B 스토리 옷 |
| 12 | `ribbon` | 선물 배달 왔어요 | 내가 선물이야! | false | 2 | |
| 13 | `popsicle` | 와삭와삭 | 시원해졌어~ | **true** | **3** | 첫 페어 옷 |
| 14 | `copter` | 대나무 헬리콥터 | 하늘을 날진 못한다 | false | 2 | |
| 15 | `party` | 파티 츄와와 | 언제나 냐냐를 응원해! | false | 2 | A→B 강등 (퀄 일관성) |
| 16 | `angry` | 분노 츄와와 | 화를 참을 수 없다, 아르르륵!!! | false | 2 | A→B 강등 (퀄 일관성) |

### TypeScript 코드 블록

```ts
export const CLOTHES_B: Record<string, ClothEntry> = {
  sprout:   { id: 'sprout',   name: '새싹 츄와와',     grade: 'B', pair: false, applyTo: 'idle', description: '어느날 머리에서 새싹이 자라났다.' },
  oops:     { id: 'oops',     name: '웁스...',         grade: 'B', pair: false, applyTo: 'idle', description: '츄와와야, 안돼!' },
  glasses:  { id: 'glasses',  name: '또또기 츄와와',   grade: 'B', pair: false, applyTo: 'idle', description: '어쩐지 똑똑해보인다!' },
  silky:    { id: 'silky',    name: '참기름 츄와와',   grade: 'B', pair: false, applyTo: 'idle', description: '겨드랑이에는 엘라스틴을 하면 안 돼요' },
  silly:    { id: 'silly',    name: '바보 츄와와',     grade: 'B', pair: false, applyTo: 'idle', description: '자신이 똑똑하다고 생각한다...' },
  snack:    { id: 'snack',    name: '야식 타임',       grade: 'B', pair: false, applyTo: 'idle', description: '먹다 남은 음식이다!' },
  muscle:   { id: 'muscle',   name: '근육 츄와와',     grade: 'B', pair: false, applyTo: 'idle', description: '운동 많이 된다' },
  muddy:    { id: 'muddy',    name: '헥헥 산책조아',   grade: 'B', pair: false, applyTo: 'idle', description: '이따 목욕 당첨이다!' },
  collar:   { id: 'collar',   name: '산책 준비',       grade: 'B', pair: false, applyTo: 'idle', description: '1시간 째 기다리고 있다...' },
  shades:   { id: 'shades',   name: '멋쟁이 츄와와',   grade: 'B', pair: false, applyTo: 'idle', description: '힙해졌다! ...그것 뿐이다' },
  rose:     { id: 'rose',     name: '꽃을 든 와와',    grade: 'B', pair: false, applyTo: 'idle', description: '오늘은 고백할테야!' }, // 🎀 B 스토리 옷
  ribbon:   { id: 'ribbon',   name: '선물 배달 왔어요', grade: 'B', pair: false, applyTo: 'idle', description: '내가 선물이야!' },
  popsicle: { id: 'popsicle', name: '와삭와삭',        grade: 'B', pair: true,  applyTo: 'idle', description: '시원해졌어~' }, // 첫 페어 옷
  copter:   { id: 'copter',   name: '대나무 헬리콥터',  grade: 'B', pair: false, applyTo: 'idle', description: '하늘을 날진 못한다' },
  party:    { id: 'party',    name: '파티 츄와와',     grade: 'B', pair: false, applyTo: 'idle', description: '언제나 냐냐를 응원해!' }, // A→B 강등
  angry:    { id: 'angry',    name: '분노 츄와와',     grade: 'B', pair: false, applyTo: 'idle', description: '화를 참을 수 없다, 아르르륵!!!' }, // A→B 강등
};
```

---

## A 등급 (8개) ✅ 완료

> 데이트 룩. 효과 1개. `applyTo: 'idle'`. 효과 4종 × 2벌 균형.

### 메타 표

| # | id | 이름 | 설명 | 페어 | 자산 | 효과 | 형님 용어 | 스토리 |
|---|---|---|---|---|---|---|---|---|
| 1 | `thief` | 도독이야!!! | 쥬인님, 전 도독이 되었습니다 | **true** | 3 | `chiSpeedMul: 1.3` | 속도 | |
| 2 | `vacation` | 야호, 휴가다! | 냐냐와 함께 바닷가로 놀러왔어! | true | 3 | `catSpeedMul: 0.85` | 추적 | 🎀 A 스토리 |
| 3 | `ascend` | 승천 | 인터넷을 비추는 한 줄기의 빛 ☆ | true | 3 | `chiSpeedMul: 1.3` | 속도 | |
| 4 | `fallen` | 타락 | 전파를 퍼트리는 중 ★ | true | 3 | `pigeonSpawnMul: 1.4` | 안전 | |
| 5 | `maid` | 메이드 츄와와 | 모에모에큥~♡ | false | 2 | `itemSpawnMul: 0.75` | 운 | |
| 6 | `fanclub` | 최고다, 냐냐짱! | 냐냐 팬클럽 1기 회장. 부원수 1명 | false | 2 | `pigeonSpawnMul: 1.4` | 안전 | |
| 7 | `santa` | 산타 와라버지 | 울어도 돼 사실 난 루돌프거든 | true | 3 | `itemSpawnMul: 0.75` | 운 | |
| 8 | `bee` | 윙윙! | 꽃밭으로 날아간다! | true | 3 | `catSpeedMul: 0.85` | 추적 | |

### 효과 분포 (4종 × 2벌)

| 효과 | 수치 | 옷 |
|---|---|---|
| `chiSpeedMul` (속도) | 1.3 | thief, ascend |
| `catSpeedMul` (추적) | 0.85 | vacation 🎀, bee |
| `pigeonSpawnMul` (안전) | 1.4 | fallen, fanclub |
| `itemSpawnMul` (운) | 0.75 | maid, santa |

### TypeScript 코드 블록

```ts
export const CLOTHES_A: Record<string, ClothEntry> = {
  thief: {
    id: 'thief', name: '도독이야!!!', grade: 'A', pair: true, applyTo: 'idle',
    description: '쥬인님, 전 도독이 되었습니다',
    effects: { chiSpeedMul: 1.3 },
  },
  vacation: {
    id: 'vacation', name: '야호, 휴가다!', grade: 'A', pair: true, applyTo: 'idle',
    description: '냐냐와 함께 바닷가로 놀러왔어!',
    effects: { catSpeedMul: 0.85 },
    // 🎀 웨딩 해금 조건의 A 단계 스토리 옷
  },
  ascend: {
    id: 'ascend', name: '승천', grade: 'A', pair: true, applyTo: 'idle',
    description: '인터넷을 비추는 한 줄기의 빛 ☆',
    effects: { chiSpeedMul: 1.3 },
  },
  fallen: {
    id: 'fallen', name: '타락', grade: 'A', pair: true, applyTo: 'idle',
    description: '전파를 퍼트리는 중 ★',
    effects: { pigeonSpawnMul: 1.4 },
  },
  maid: {
    id: 'maid', name: '메이드 츄와와', grade: 'A', pair: false, applyTo: 'idle',
    description: '모에모에큥~♡',
    effects: { itemSpawnMul: 0.75 },
  },
  fanclub: {
    id: 'fanclub', name: '최고다, 냐냐짱!', grade: 'A', pair: false, applyTo: 'idle',
    description: '냐냐 팬클럽 1기 회장. 부원수 1명',
    effects: { pigeonSpawnMul: 1.4 },
  },
  santa: {
    id: 'santa', name: '산타 와라버지', grade: 'A', pair: true, applyTo: 'idle',
    description: '울어도 돼 사실 난 루돌프거든',
    effects: { itemSpawnMul: 0.75 },
  },
  bee: {
    id: 'bee', name: '윙윙!', grade: 'A', pair: true, applyTo: 'idle',
    description: '꽃밭으로 날아간다!',
    effects: { catSpeedMul: 0.85 },
  },
};
```

### 페어 ↔ 냐냐 자산 매핑 (헷갈림 방지)

| 옷 id | 츄 (chi-full) | 냐 (cat-full) |
|---|---|---|
| `thief` | 복면강도 와와 | 경찰복 회색 냐냐 |
| `vacation` | 파란 줄무늬 수영복 | 노란 프릴 원피스 |
| `ascend` | 후광+흰날개 천사 | 후광+흰날개 천사 |
| `fallen` | 뿔+박쥐날개 악마 | 뿔+박쥐날개 악마 |
| `santa` | 루돌프(뿔+빨간코) | 산타복+모자 |
| `bee` | 꿀벌(더듬이+줄무늬) | 해바라기 갈기 |

---

## S 등급 (2개)

> 페어 확정, 효과 무제한 조합, `applyTo: 'all'`.
> S 등급은 여러 벌 예정. 일부 코스튬만 전용 엔딩 보유 (현재 `propose`만).

### S 등급 자산 규약

- `kissingAsset: true`인 옷만 chi/cat-{id}-kissing.png 제작 (옵션 B 확정 — 엔딩 있는 옷만).
- 기본 자산: chi-full + chi-object + cat-full = **3장**. kissing 있으면 +2장 = **5장**.

| 파일명 | 크기 | 용도 | 대상 |
|---|---|---|---|
| `chi-{id}-full.png` | 256×256 | 츄 idle 풀바디 | 모든 S |
| `chi-{id}-object.png` | 128×128 | 그리드 아이콘 | 모든 S |
| `cat-{id}-full.png` | 256×256 | 냐 idle 풀바디 | 모든 S |
| `chi-{id}-kissing.png` | 256×256 | 츄 뽀뽀 모션 | `kissingAsset: true`만 |
| `cat-{id}-kissing.png` | 256×256 | 냐 수줍 모션 | `kissingAsset: true`만 |

### 메타 표

| # | id | 이름 | 설명 | 페어 | 자산 | 효과 | 엔딩 | 스토리 |
|---|---|---|---|---|---|---|---|---|
| 1 | `propose` | 프로포즈 | 나랑 결혼해줄래? | true | 5 | `catSpeedMul:0.7` + `pigeonSpawnMul:1.7` | ✅ `propose` | 🎀 S 스토리 |
| 2 | `joseon` | 돌쇠와 마님 | 둘의 전생일수도? | true | 3 | `chiSpeedMul:1.5` + `pigeonSpawnMul:1.7` | — | |

### TypeScript 코드 블록

```ts
// ClothEntry 인터페이스 추가 필드:
//   kissingAsset?: boolean   // true면 chi/cat-{id}-kissing.png 존재
//   endingId?: string        // 엔딩 컷신 트리거 마커 (LV10 도달 시 재생)

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
    // 🎀 웨딩 해금 조건의 S 단계 스토리 옷
  },
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
};
```

### 페어 ↔ 냐냐 자산 매핑

| 옷 id | chi-full | chi-kissing | cat-full | cat-kissing |
|---|---|---|---|---|
| `propose` | 실크가운+반지케이스 츄(서있음) | 하트+반지 내미는 츄(뽀뽀) | 실크가운 냐(서있음) | 입가린 수줍 냐+볼하트(검정배경) |
| `joseon` | 갓+도포+배낭 츄 | — | 분홍 한복+노리개 냐 | — |

⚠️ `cat-propose-kissing.png`만 **검정 배경** (PIL `mode='dark'`). 나머지 4장 흰 배경.

### 🎬 엔딩 컷신

`propose` 착용 + 솔로 LV10 도달 시 프로포즈 엔딩 시퀀스 재생 → 웨딩룩(S+) 해금.
상세 명세는 `ENDING_SPEC.md` 참조.


---

## S+ 등급 (0개 + 1개 예약)

### 예약: 웨딩 코스튬 (`wedding`)

자산/명세는 사이클 E에서 결정. 메타 예약:

```ts
wedding: {
  id: 'wedding',
  name: '웨딩 코스튬',  // 가칭
  grade: 'S+',
  pair: false,
  applyTo: 'all',
  description: '결혼식 날.',  // 가칭
  effects: {
    pigeonDisabled: true,
    backgroundOverride: 'wedding-bg',
    triggerEnding: 'wedding-ending',
  },
}
```

---

## 자산 작업 체크리스트

자산 파일명 규약 (`public/assets/clothes/` 평면 구조):
```
chi-{id}-full.png      # 256×256, 모든 옷 필수
chi-{id}-object.png    # 128×128, 모든 옷 필수
cat-{id}-full.png      # 256×256, 페어 옷만
```
⚠️ `cat-{id}-object`는 안 만듦 (사이클 W 결정 — 그리드 카드는 chi-object + 페어 표시 아이콘).
⚠️ 상세 파일명 표는 `ASSET_FILENAMES.md` 참조.

### 검정 배경 옷 (PIL `mode='dark'`, threshold≈20)
- `shades`, `rose`

### 나머지 흰 배경 (PIL `mode='light'`, threshold≈230)

---

## 통계

| 등급 | 옷 개수 | 페어 | 단일 | 자산 장 수 |
|---|---|---|---|---|
| B | 16 | 1 | 15 | 15×2 + 1×3 = **33** |
| A | 8 | 6 | 2 | 2×2 + 6×3 = **22** |
| S | 2 | 2 | 0 | 1×5 + 1×3 = **8** |
| S+ | 0 (1개 예약) | 0 | 1 | (사이클 E) |
| **합계** | **26 + 1 예약** | **9** | **17** | **63 + 사이클 E** |

---

## 진행 예정

- ~~A 등급~~ ✅ 완료 (8벌)
- **S 등급**: "프로포즈 룩" 컨셉, 페어 확정. `propose` 1벌 등록됨. 추천 3~4벌 (더 진행 예정).
- **S+ 등급**: 웨딩 1벌 (사이클 E)

옷 보유 10벌 해금 조건: 현재 B 16 + A 8 + S 1 = **25벌**로 충분.
