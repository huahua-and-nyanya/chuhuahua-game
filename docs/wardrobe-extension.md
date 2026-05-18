# 옷 추가 워크플로우

> 새 옷을 옷장에 추가하려면 이 가이드를 따라간다.
> 시스템 전반 명세는 `docs/wardrobe_spec.md` 참조.

---

## 단계 1: 옷 설계

- **ID**: kebab-case 영문. 중복 금지. 예: `sprout`, `winter-coat`, `wedding-dress`
- **이름**: 한국어 UI 노출명
- **등급**: `B` / `A` / `S` / `S+` 중 하나
- **페어 여부**: `true`면 츄+냐 동시 외형 (자산 4장 필요)
- **적용 범위 (`applyTo`)**:
  - `B` / `A` → `'idle'` (강제, idle 스프라이트만)
  - `S` / `S+` → `'all'` (강제, 모든 모션)
- **효과**: `ClothEffects` 인터페이스. 등급 정책 표 (`wardrobe_spec.md` 섹션 4.1) 따름

---

## 단계 2: 자산 준비

| 자산 | 사양 | 처리 |
| --- | --- | --- |
| `chi-{id}-full.png` | 256×256 PNG letterbox | 풀바디, 흰배경 flood-fill |
| `chi-{id}-object.png` | 128×128 PNG | 옷장 그리드 아이콘 |
| `cat-{id}-full.png` | 256×256 PNG letterbox | 페어 옷일 때만 |
| `cat-{id}-object.png` | 128×128 PNG | 페어 옷일 때만 |

처리 패턴(flood-fill threshold 등)은 `wardrobe_spec.md` 섹션 6.3 참조.

**letterbox 정합 주의**: 본체 캐릭터(`chihuahua.png`)와 옷 풀바디의 letterbox 규약이 같아야 갈아입을 때 위치 안 어긋남. 본체 사이즈 먼저 확인.

---

## 단계 3: 자산 배치

```
public/assets/clothes/
├─ chi-{id}-full.png
├─ chi-{id}-object.png
├─ cat-{id}-full.png    (페어 옷만)
└─ cat-{id}-object.png  (페어 옷만)
```

평면 디렉토리. 등급별 폴더 분리 안 함.

---

## 단계 4: 메타 등록

`src/features/wardrobe/clothes.ts`의 `CLOTHES` 객체에 항목 추가:

```ts
export const CLOTHES: Record<string, ClothEntry> = {
  sprout: {
    id: 'sprout',
    name: '새싹',
    grade: 'B',
    pair: false,
    applyTo: 'idle',
  },
  speedBoots: {
    id: 'speed-boots',
    name: '스피드 부츠',
    grade: 'A',
    pair: false,
    applyTo: 'idle',
    effects: { chiSpeedMul: 1.15 },
  },
  weddingCostume: {
    id: 'wedding-costume',
    name: '웨딩 코스튬',
    grade: 'S+',
    pair: false,
    applyTo: 'all',
    effects: {
      pigeonDisabled: true,
      backgroundOverride: 'wedding-bg',
      triggerEnding: 'wedding-ending',
    },
  },
}
```

- 객체 키는 camelCase, `id` 필드는 kebab-case
- 페어 옷이면 `pair: true` 명시

---

## 단계 5: 검증

```bash
pnpm tsc --noEmit   # 타입 통과
pnpm lint           # 린트 통과
pnpm build          # 빌드 통과
```

추가로:

- `validateClothEffects(grade, effects)` 호출 시 위반 배열이 비어야 함 (사이클 W 이후엔 옷 등록 시 콘솔 경고로 노출)
- 자산 파일 누락 시 콘솔 경고 확인 (사이클 W 이후)

---

## 등급별 가이드

| 등급 | effects | 적용 범위 | 비고 |
| --- | --- | --- | --- |
| B | 없음 (빈 객체도 X) | idle | 외형 장식만 |
| A | 1개만 | idle | 능력치 1개 (chiSpeedMul / catSpeedMul / pigeonSpawnMul / itemSpawnMul) |
| S | 여러 개 | all | 능력치 조합 자유 |
| S+ | 여러 개 | all | 특수 필드 (pigeonDisabled / backgroundOverride / triggerEnding) 사용 가능. 단 사이클 W/E 이전엔 동작 안 함 |

---

## 페어 옷 추가 시 추가 단계

- `cat-{id}-full.png`, `cat-{id}-object.png` 두 장 추가
- 메타에 `pair: true` 명시
- 가챠 추첨 시 등장 확률 ×0.7 자동 적용 (`PAIR_WEIGHT_MULTIPLIER`)
- S+는 페어 옷 만들지 않음 (`wardrobe_spec.md` 섹션 2.1)

---

## 자주 하는 실수

- B 등급에 `effects` 객체 부여 → `validateClothEffects` 위반
- A 등급에 효과 2개 이상 → `maxEffects` 초과 위반
- 옷 ID에 underscore / 대문자 사용 → 자산 파일명 규약 깨짐
- 본체 letterbox와 옷 letterbox 다름 → 갈아입을 때 캐릭터 위치 어긋남
- 페어 옷인데 cat 자산 누락 → 가챠로 뽑은 후 렌더 에러
- S+에 `pigeonSpawnMul` / `itemSpawnMul` 부여 → S+ allowedFields에 없음 (S 등급용)
