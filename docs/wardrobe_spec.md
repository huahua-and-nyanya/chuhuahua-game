# 옷장 시스템 명세 (chuhuahua-game)

> **버전 2.0** (2026-05-15 갱신)
> 기존 데모(N/A/S 등급, 단일 옷) → 신규(B/A/S/S+, 페어 시스템, S+ 게임 변형)로 전면 개편.
> 이 문서는 휘게-Claude 사이 합의 문서이자, 사이클 2.5의 input. 사이클 2.5 종료 후 `docs/wardrobe-system.md`로 코드 저장소에 정착.

## 변경 이력

- **v1** (~2026-05-15 이전): 기존 JSX 데모 기준. N/A/S 등급, sprout/wings/angry 옷 3종.
- **v2** (현재): 신 등급(B/A/S/S+), 페어 시스템, sub-grade 확률 보정, 적용 범위 분기, S+ 게임 변형.
- v2 작성 시점에 **실제 옷 항목 0개** — 이전 sprout/wings/angry는 폐기 또는 새 등급 정책에 맞춰 재정의 예정.

---

## 1. 등급 체계

옷은 네 등급으로 나뉜다. 등급은 효과의 **종류**와 **개수**를 제약한다.

| 등급   | 라벨      | 효과 범위         | 효과 개수 | 적용 범위         |
| ------ | --------- | ----------------- | --------- | ----------------- |
| **B**  | Common    | 외형만 (cosmetic) | 0         | idle 스프라이트만 |
| **A**  | Rare      | 작은 능력치 1개   | 1         | idle 스프라이트만 |
| **S**  | Epic      | 다양한 능력치     | 무제한    | 모든 모션         |
| **S+** | Legendary | 게임 자체 변형    | 무제한    | 모든 모션         |

### 1.1 등급별 효과 예시

| 등급 | 예시                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| B    | "새싹" — 외형 장식. 능력 변화 없음                                                                              |
| A    | "스피드 부츠" — `chiSpeedMul: 1.15`                                                                             |
| S    | "스피드 + 행운의 부적" — `chiSpeedMul: 1.2` + `itemSpawnMul: 0.7`                                               |
| S+   | "웨딩 코스튬" — `pigeonDisabled: true` + `backgroundOverride: 'wedding-bg'` + `triggerEnding: 'wedding-ending'` |

### 1.2 가챠 등장 비율

기본 비율 (페어 보정 적용 전):

| 등급 | 비율 |
| ---- | ---- |
| B    | 60%  |
| A    | 30%  |
| S    | 9%   |
| S+   | 1%   |

페어 옷은 sub-grade로 분류되어 등장 확률 **×0.7** (= -30%). 사용자에겐 동일 등급으로 노출.

예시: B 등급 풀에 단일 옷 3종 + 페어 옷 1종이면, 가중치는 `[1.0, 1.0, 1.0, 0.7]` → 페어 옷이 살짝 덜 뽑힘.

> 천장 시스템 (피티) 수치는 사이클 W에서 결정.

---

## 2. 페어 시스템

페어 옷은 츄와와와 냐냐(고양이)가 **동시에 같은 테마의 옷**을 입는 시스템.

### 2.1 작동 방식

- 옷 메타에 `pair: true`
- 자산 PNG 4장 필요: `chi-{id}-full`, `chi-{id}-object`, `cat-{id}-full`, `cat-{id}-object`
- 가챠 추첨 시 등장 확률 ×0.7 (sub-grade 보정)
- 모든 등급에 적용 가능 — **단 S+는 페어 없음** (S+는 시그니처 단일 컨셉이라 페어 불필요)

### 2.2 적용 시점

- 솔로 모드: 츄와와는 입은 옷 외형 적용, NPC 냐냐도 페어 외형 적용
- PvP 모드: 두 플레이어가 각자 입은 옷의 외형 적용 (한 명이 페어 옷을 입었다고 상대까지 강제 변경되지 않음 — **각자 본인 옷만**)

---

## 3. 적용 범위 (applyTo)

옷이 캐릭터의 어떤 모션에 적용되는지를 결정.

| 값       | 의미                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| `'idle'` | 기본 스프라이트에만 적용. 모션(kissing/sad/slowed/scared 등)에서는 본래 모습 |
| `'all'`  | 모든 모션에 적용                                                             |

### 3.1 등급별 기본값

- B / A 등급 → `'idle'` (강제)
- S / S+ 등급 → `'all'` (강제)

### 3.2 옷장 UI 안내

옷장 화면에 다음 안내 문구 노출:

> "옷은 기본 스프라이트에만 적용됩니다. 특정 모션(뽀뽀, 슬픈 표정 등)에서는 본래 모습으로 표시됩니다.  
> ※ S 등급 이상은 모든 모션에 적용됩니다."

> 정확한 문구는 사이클 W에서 결정.

### 3.3 모션 우선순위 (참고)

기존 JSX 데모에서 검증된 우선순위 — 새 프로젝트에서도 유지.

**츄와와**: `kissing` > `sad` > `slowed` > `equipped(옷)` > `default`  
**냐냐**: `kissing` > `shielded` > `slowed` > `angry` > `scared` > `equipped(옷)` > `default`

`equipped`는 `applyTo`가 `'all'`이면 우선순위가 최상위로 올라감 (S/S+ 등급).

---

## 4. 효과 인터페이스 (ClothEffects)

```ts
export type ClothEffects = {
  // A, S 등급 — 능력치 변화 (게임 루프에서 곱연산 적용)
  chiSpeedMul?: number // 츄 속도 배수 (>1.0 = ↑)
  catSpeedMul?: number // 냐 속도 배수 (페어 옷에서만 의미)
  pigeonSpawnMul?: number // 비둘기 스폰 간격 배수 (>1.0 = 빈도 ↓)
  itemSpawnMul?: number // 아이템 스폰 간격 배수 (<1.0 = 빈도 ↑)

  // S+ 전용 — 게임 변형
  pigeonDisabled?: boolean // 비둘기 출현 무효
  backgroundOverride?: string // 배경 자산 키 (예: 'wedding-bg')
  triggerEnding?: string // 이벤트 ID, 11레벨 도달 시 발동
}
```

### 4.1 등급별 허용 필드 (GRADE_POLICY)

| 등급 | maxEffects | allowedFields                                                               |
| ---- | ---------- | --------------------------------------------------------------------------- |
| B    | 0          | (없음)                                                                      |
| A    | 1          | chiSpeedMul, catSpeedMul, pigeonSpawnMul, itemSpawnMul                      |
| S    | ∞          | chiSpeedMul, catSpeedMul, pigeonSpawnMul, itemSpawnMul                      |
| S+   | ∞          | chiSpeedMul, catSpeedMul, pigeonDisabled, backgroundOverride, triggerEnding |

### 4.2 검증 함수

```ts
validateClothEffects(grade, effects): string[]
```

런타임에 호출. 빌드는 안 깸. 위반 사항을 문자열 배열로 반환. 사이클 W에서 옷 등록 시 콘솔 경고 출력.

**동작 명세**: 두 가지 독립 검사를 모두 수행하고 위반 메시지를 누적한다.

1. 효과 개수 검사 (maxEffects 초과 시 위반)
2. 효과 필드 종류 검사 (allowedFields에 없는 키마다 개별 위반)
   같은 효과가 두 검사 모두 위반하면 두 메시지가 모두 반환된다.

---

## 5. 메타 인터페이스 (ClothEntry)

```ts
export type ClothEntry = {
  id: string
  name: string
  grade: Grade
  pair: boolean
  applyTo: ApplyTo
  effects?: ClothEffects
  description?: string // ← 추가, 가챠 결과 모달 등에서 표시 (선택)
}
```

### 5.1 옷 등록

`src/features/wardrobe/clothes.ts`의 `CLOTHES` 객체에 항목 추가. 자세한 방법은 `docs/wardrobe-extension.md` 참조.

---

## 6. 자산 명명 규약

### 6.1 옷 자산

위치: `public/assets/clothes/`

| 파일명                | 사양                  | 용도                                  |
| --------------------- | --------------------- | ------------------------------------- |
| `chi-{id}-full.png`   | 256×256 PNG letterbox | 츄와와 풀바디 (피팅룸 + 게임 내)      |
| `chi-{id}-object.png` | 128×128 PNG           | 옷장 그리드 카드 아이콘 (츄와와 기준) |
| `cat-{id}-full.png`   | 256×256 PNG letterbox | 페어 옷 — 냐냐 풀바디                 |
| `cat-{id}-object.png` | 128×128 PNG           | 페어 옷 — 냐냐 그리드 카드            |

### 6.2 보조 자산

| 파일 경로                                    | 사양                | 용도                         |
| -------------------------------------------- | ------------------- | ---------------------------- |
| `public/assets/ui/coin-icon.png`             | 64×64 PNG           | 메인/게임오버/옷장 코인 표시 |
| `public/assets/ui/capsule-icon.png`          | 64×64 PNG           | 가챠 버튼                    |
| `public/assets/backgrounds/fitting-room.jpg` | JPEG q78, ~700px 폭 | 옷장 화면 피팅룸 배경        |

### 6.3 자산 처리 패턴 (휘게 PIL 작업)

```python
# 풀바디 (chi-{id}-full / cat-{id}-full): 흰배경 제거 + letterbox
edges_flood_fill(mode='light', threshold=230)
crop_to_content() → letterbox_to_square(256, pad_ratio=0.05)
PNG optimize=True

# 오브젝트 (chi-{id}-object / cat-{id}-object): 배경 제거
edges_flood_fill(mode='light' or 'dark', threshold=230 or 20)
resize to 128×128
PNG optimize=True
```

### 6.4 본체 캐릭터와의 letterbox 정합

`chihuahua.png` 본체와 `chi-{id}-full.png` 옷 풀바디는 **동일 letterbox 규약**이어야 함. 사이즈/패딩이 다르면 옷 갈아입을 때 캐릭터 위치 어긋남.

사이클 2.5 진입 시 사이클 2의 본체 사이즈를 확인해서 옷 풀바디를 본체에 맞춤. 본체가 256×256이 아니면 둘 다 통일.

---

## 7. 경로 헬퍼

```ts
clothPath(character: 'chi' | 'cat', id: string, kind: 'full' | 'object'): string
// 예: clothPath('chi', 'sprout', 'full') → '/assets/clothes/chi-sprout-full.png'

COIN_ICON_PATH        // '/assets/ui/coin-icon.png'
CAPSULE_ICON_PATH     // '/assets/ui/capsule-icon.png'
FITTING_ROOM_BG_PATH  // '/assets/backgrounds/fitting-room.jpg'
```

---

## 8. 저장소 키 (localStorage)

| 키                     | 데이터                                          |
| ---------------------- | ----------------------------------------------- |
| `chuhuahua:coins`      | 누적 코인 (number)                              |
| `chuhuahua:wardrobe`   | `{ owned: string[], equipped: string \| null }` |
| `chuhuahua:gacha-pity` | 가챠 천장 카운터 (number)                       |

> 사이클 W 진입 시 Supabase 연동 검토. 현재는 로컬만.

---

## 9. S+ 특수 효과 상세

S+ 등급은 게임 루프에 깊게 통합되므로 별도 명세 필요.

### 9.1 `pigeonDisabled: true`

- 솔로 모드의 비둘기 스폰 시스템 OFF
- PvP 모드에선 비둘기가 이미 OFF라 무관
- 적용 위치: 비둘기 스폰 함수의 가드

### 9.2 `backgroundOverride: 'wedding-bg'`

- 솔로 게임 배경을 옷 전용 배경으로 교체
- 기존 `GAME_BGS` 로테이션을 override
- 적용 위치: 배경 렌더러
- 자산: `public/assets/backgrounds/{key}.jpg`

### 9.3 `triggerEnding: 'wedding-ending'`

- 솔로 모드 11레벨 도달 시 엔딩 이벤트 발동
- 동물의 숲 풍 간단한 연출 (정적 컷씬 + 텍스트)
- 적용 위치: 레벨 업 이벤트 핸들러
- 엔딩 자산/로직: **사이클 E**에서 별도 작업

---

## 10. 옷장 UI 정책

> UI 디자인 자체는 사이클 W에서 결정. 이 섹션은 기능 명세만.

### 10.1 화면 단위

1. **옷장 진입점** — 메인 화면에 옷장 진입 버튼
2. **피팅룸** — 화면 상단 50%, 츄와와(또는 츄+냐 페어) 풀바디 미리보기
3. **그리드** — 화면 하단 50%, 보유 옷 그리드 (오브젝트 아이콘)
4. **가챠 모달** — 가챠 버튼 클릭 → 결과 모달 (당첨 옷 풀바디 + 등급)

### 10.2 그리드 카드 표시

- 보유 옷: 풀컬러 오브젝트 + 등급 배지
- 미보유 옷: 그레이스케일 또는 ?? 처리 (선택)
- 현재 장착 옷: 강조 테두리
- 페어 옷: 카드에 페어 표시 아이콘

### 10.3 안내 메시지

섹션 3.2 참조.

---

## 11. 사이클 매핑

| 사이클                | 옷장 관련 작업                                                               |
| --------------------- | ---------------------------------------------------------------------------- |
| **2.5** (현재)        | 등급 정책, 메타 인터페이스, 경로 헬퍼, 시스템/워크플로우 문서                |
| **B**                 | Chihuahua/Cat 컴포넌트에 `equippedSrc?: string` prop 정의. 옷 로직은 안 만짐 |
| **C** (솔로 엔드리스) | 게임 루프에 옷 효과 훅 자리 마련 (chiSpeedMul, pigeonSpawnMul 적용 지점)     |
| **F** (로컬 PvP)      | 동일하게 효과 훅 자리 (PvP 가드 포함)                                        |
| **W** (옷장 features) | 옷장 UI, 가챠 추첨 로직, 효과 실제 동작, 천장 시스템, localStorage 연동      |
| **E** (S+ 이벤트)     | 11레벨 엔딩 이벤트, S+ 옷 자산, 배경 override 로직                           |

각 사이클 진입 시 이 문서 섹션 11을 참조해서 작업 범위 확인.

---

## 12. 미결정 / 향후 결정

| 항목                                          | 결정 시점             |
| --------------------------------------------- | --------------------- |
| `PAIR_WEIGHT_MULTIPLIER` 정확한 값 (현재 0.7) | 사이클 W 테스트 후    |
| 천장 시스템 수치 (몇 회 안 뽑히면 S+ 보장?)   | 사이클 W              |
| 옷장 안내 메시지 정확한 문구                  | 사이클 W              |
| 그리드 카드 등급 배지 디자인                  | 사이클 W              |
| 미보유 옷 표시 방식 (그레이스케일 vs ??)      | 사이클 W              |
| 가챠 연출 (회전, 광선 등)                     | 사이클 W              |
| S+ 엔딩 이벤트 시나리오                       | 사이클 E              |
| 페어 옷에서 한쪽만 입었을 때 처리             | 사이클 W 진입 시 결정 |
| Supabase 옷장 데이터 동기화                   | 사이클 W 이후 별도    |
| 연속 뽑기 (10연차) 도입 정책                  | 사이클 W              |
| 카테고리 가챠 — 카테고리 정의 + 픽업 확률     | 사이클 W              |
| 한정 옷 시스템 운영 여부                      | 사이클 W              |

---

## 13. 가챠 정책

### 13.1 비용

- 1회 가챠: **15코인**

### 13.2 중복 환불

중복 옷 획득 시 등급별 코인 환불:

| 등급 | 환불                       |
| ---- | -------------------------- |
| B    | 1코인                      |
| A    | 3코인                      |
| S    | 5코인                      |
| S+   | 해당 없음 (섹션 13.3 참조) |

### 13.3 S+ 단발 규칙

S+ 등급 옷은 한 번 획득하면 가챠 풀에서 영구 제외. 가챠 추첨 로직은 보유 옷 ID 리스트를 확인해 S+ 풀을 동적으로 필터링한다. 즉 S+ 중복은 발생하지 않는다.
**S+ 풀이 비었을 때 처리**: 사이클 W에서 결정 (옵션: 1%를 S로 흡수 / B+A+S 비율 재계산 / 한 단계 아래 폴백).

### 13.4 가챠 결과 모달 표시

- 뽑은 옷을 착용한 츄와와 풀바디 이미지 (256×256, 페어 옷은 츄+냐 동시)
- 옷 이름 + 등급 배지
- 옷 설명 (선택)
- 중복 시: 환불 코인 수 표시 ("이미 보유 — N코인 환불!")
- 신규 획득 시: "획득!" 표시

---

## 14. 참조 문서

- `docs/wardrobe-extension.md` — 옷 추가 워크플로우 (휘게 작업 가이드)
- `docs/assets-mapping.md` — 자산 매핑 전체 (옷장 섹션 포함)
- `CLAUDE.md` — 옷장 작업 시 위 문서 참조 의무 명시
