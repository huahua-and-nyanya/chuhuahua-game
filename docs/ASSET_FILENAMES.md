# 자산 파일명 표 (B + A + S 등급)

> `public/assets/clothes/` 평면 구조. 모든 파일 소문자.
> B/A 단일 = 2장 (`chi-full` + `chi-object`) / B/A 페어 = 3장 (+ `cat-full`)
> S 페어 = 5장 (+ `chi-kissing` + `cat-kissing`) — idle + 뽀뽀 모션 양쪽 옷 적용
> ⚠️ `cat-{id}-object`는 만들지 않음 (사이클 W 결정 — 그리드 카드는 chi-object + 페어 표시 아이콘)

---

## 파일명 규약

| 종류           | 파일명                 | 크기    | 대상                                  |
| -------------- | ---------------------- | ------- | ------------------------------------- |
| 풀바디 (츄)    | `chi-{id}-full.png`    | 256×256 | 모든 옷 필수 — 피팅룸 + 게임내 풀바디 |
| 오브젝트 (츄)  | `chi-{id}-object.png`  | 128×128 | 모든 옷 필수 — 도감 그리드 아이콘     |
| 풀바디 (냐)    | `cat-{id}-full.png`    | 256×256 | 페어 옷만                             |
| 뽀뽀 모션 (츄) | `chi-{id}-kissing.png` | 256×256 | **S 등급만** — 키싱 순간 옷 적용      |
| 수줍 모션 (냐) | `cat-{id}-kissing.png` | 256×256 | **S 등급만** — 키싱 순간 옷 적용      |

---

## B 등급 (14벌 · 자산 29장)

| #   | id         | 이름             | 페어 | chi-full                | chi-object                | cat-full                | 배경    |
| --- | ---------- | ---------------- | ---- | ----------------------- | ------------------------- | ----------------------- | ------- |
| 1   | `sprout`   | 새싹 츄와와      |      | `chi-sprout-full.png`   | `chi-sprout-object.png`   | —                       | 흰      |
| 2   | `oops`     | 웁스...          |      | `chi-oops-full.png`     | `chi-oops-object.png`     | —                       | 흰      |
| 3   | `glasses`  | 또또기 츄와와    |      | `chi-glasses-full.png`  | `chi-glasses-object.png`  | —                       | 흰      |
| 4   | `silky`    | 참기름 츄와와    |      | `chi-silky-full.png`    | `chi-silky-object.png`    | —                       | 흰      |
| 5   | `silly`    | 바보 츄와와      |      | `chi-silly-full.png`    | `chi-silly-object.png`    | —                       | 흰      |
| 6   | `snack`    | 야식 타임        |      | `chi-snack-full.png`    | `chi-snack-object.png`    | —                       | 흰      |
| 7   | `muscle`   | 근육 츄와와      |      | `chi-muscle-full.png`   | `chi-muscle-object.png`   | —                       | 흰      |
| 8   | `muddy`    | 헥헥 산책조아    |      | `chi-muddy-full.png`    | `chi-muddy-object.png`    | —                       | 흰      |
| 9   | `collar`   | 산책 준비        |      | `chi-collar-full.png`   | `chi-collar-object.png`   | —                       | 흰      |
| 10  | `shades`   | 멋쟁이 츄와와    |      | `chi-shades-full.png`   | `chi-shades-object.png`   | —                       | ⚠️ 검정 |
| 11  | `rose`     | 꽃을 든 와와 🎀  |      | `chi-rose-full.png`     | `chi-rose-object.png`     | —                       | ⚠️ 검정 |
| 12  | `ribbon`   | 선물 배달 왔어요 |      | `chi-ribbon-full.png`   | `chi-ribbon-object.png`   | —                       | 흰      |
| 13  | `popsicle` | 와삭와삭         | ✓    | `chi-popsicle-full.png` | `chi-popsicle-object.png` | `cat-popsicle-full.png` | 흰      |
| 14  | `copter`   | 대나무 헬리콥터  |      | `chi-copter-full.png`   | `chi-copter-object.png`   | —                       | 흰      |
| 15  | `party`    | 파티 츄와와      |      | `chi-party-full.png`    | `chi-party-object.png`    | —                       | 흰      |
| 16  | `angry`    | 분노 츄와와      |      | `chi-angry-full.png`    | `chi-angry-object.png`    | —                       | 흰      |

> ⚠️ B는 원래 14벌이었으나 A에서 강등된 `party`, `angry` 추가로 **16벌**.
> 🎀 `rose` = 웨딩 해금 B 단계 스토리 옷.
> 검정 배경 옷(`shades`, `rose`)은 PIL `mode='dark'` (threshold≈20).

---

## A 등급 (8벌 · 자산 20장)

| #   | id         | 이름             | 페어 | 효과 | chi-full                | chi-object                | cat-full                |
| --- | ---------- | ---------------- | ---- | ---- | ----------------------- | ------------------------- | ----------------------- |
| 1   | `thief`    | 도독이야!!!      | ✓    | 속도 | `chi-thief-full.png`    | `chi-thief-object.png`    | `cat-thief-full.png`    |
| 2   | `vacation` | 야호, 휴가다! 🎀 | ✓    | 추적 | `chi-vacation-full.png` | `chi-vacation-object.png` | `cat-vacation-full.png` |
| 3   | `ascend`   | 승천             | ✓    | 속도 | `chi-ascend-full.png`   | `chi-ascend-object.png`   | `cat-ascend-full.png`   |
| 4   | `fallen`   | 타락             | ✓    | 안전 | `chi-fallen-full.png`   | `chi-fallen-object.png`   | `cat-fallen-full.png`   |
| 5   | `maid`     | 메이드 츄와와    |      | 운   | `chi-maid-full.png`     | `chi-maid-object.png`     | —                       |
| 6   | `fanclub`  | 최고다, 냐냐짱!  |      | 안전 | `chi-fanclub-full.png`  | `chi-fanclub-object.png`  | —                       |
| 7   | `santa`    | 산타 와라버지    | ✓    | 운   | `chi-santa-full.png`    | `chi-santa-object.png`    | `cat-santa-full.png`    |
| 8   | `bee`      | 윙윙!            | ✓    | 추적 | `chi-bee-full.png`      | `chi-bee-object.png`      | `cat-bee-full.png`      |

> 🎀 `vacation` = 웨딩 해금 A 단계 스토리 옷.
> 페어 6벌 (thief/vacation/ascend/fallen/santa/bee) · 단일 2벌 (maid/fanclub).
> 효과 표준: 속도=`chiSpeedMul:1.3` / 추적=`catSpeedMul:0.85` / 안전=`pigeonSpawnMul:1.4` / 운=`itemSpawnMul:0.75`.

---

## S 등급 (2벌)

> 페어 확정 + 효과 무제한 조합 + `applyTo: 'all'`.
> kissing 자산은 `kissingAsset: true`인 옷만 (엔딩 있는 옷 한정). 나머지 S는 3장.

| #   | id        | 이름        | 효과      | chi-full               | chi-kissing               | chi-object               | cat-full               | cat-kissing               |
| --- | --------- | ----------- | --------- | ---------------------- | ------------------------- | ------------------------ | ---------------------- | ------------------------- |
| 1   | `propose` | 프로포즈 🎀 | 추적+안전 | `chi-propose-full.png` | `chi-propose-kissing.png` | `chi-propose-object.png` | `cat-propose-full.png` | `cat-propose-kissing.png` |
| 2   | `joseon`  | 돌쇠와 마님 | 속도+안전 | `chi-joseon-full.png`  | —                         | `chi-joseon-object.png`  | `cat-joseon-full.png`  | —                         |

> 🎀 `propose` = 웨딩 해금 S 단계 스토리 옷 + 🎬 전용 엔딩 컷신 보유 (`ENDING_SPEC.md`).
> `propose` 효과: `catSpeedMul:0.7` + `pigeonSpawnMul:1.7`. S 표준.
> `joseon` 효과: `chiSpeedMul:1.5` + `pigeonSpawnMul:1.7`. S 표준.
> ⚠️ `cat-propose-kissing.png`만 **검정 배경** (PIL `mode='dark'`). 나머지 흰 배경.

---

## 페어 옷 ↔ 냐냐 자산 매핑 (헷갈리기 쉬운 부분)

| 옷 id      | 츄 (chi-full)            | 냐 (cat-full)              |
| ---------- | ------------------------ | -------------------------- |
| `popsicle` | 하드바 문 와와           | 수박바 문 회색 냐냐        |
| `thief`    | 복면강도 와와            | 경찰복 회색 냐냐           |
| `vacation` | 파란 줄무늬 수영복 와와  | 노란 프릴 원피스 회색 냐냐 |
| `ascend`   | 후광+흰날개 천사 와와    | 후광+흰날개 천사 회색 냐냐 |
| `fallen`   | 뿔+박쥐날개 악마 와와    | 뿔+박쥐날개 악마 회색 냐냐 |
| `santa`    | 루돌프(뿔+빨간코) 와와   | 산타복+모자 회색 냐냐      |
| `bee`      | 꿀벌(더듬이+줄무늬) 와와 | 해바라기 갈기 회색 냐냐    |
| `propose`  | 실크가운+반지케이스 와와 | 실크가운 회색 냐냐         |

### S 등급 kissing 모션 매핑

| 옷 id     | 츄 (chi-kissing)             | 냐 (cat-kissing)                      |
| --------- | ---------------------------- | ------------------------------------- |
| `propose` | 하트 날리며 반지 내미는 와와 | 입 가린 수줍 냐냐 + 볼하트 (검정배경) |

> `joseon`은 kissing 자산 없음 (엔딩 미보유 S — 뽀뽀 시 기본 스프라이트 fall back).

---

## 전체 자산 장수 합계

| 등급     | 옷     | 단일   | 페어  | 자산 장수           |
| -------- | ------ | ------ | ----- | ------------------- |
| B        | 16     | 15     | 1     | 15×2 + 1×3 = **33** |
| A        | 8      | 2      | 6     | 2×2 + 6×3 = **22**  |
| S        | 2      | 0      | 2     | 1×5 + 1×3 = **8**   |
| **합계** | **26** | **17** | **9** | **63**              |

> S+ 웨딩(사이클 E) 미진행. S 등급 추가 옷은 구현하며 등록 예정.

---

## 엔딩 배경 자산

| 파일명                                     | 코드 키     | 컨셉                  | 규격                 | 용도                     |
| ------------------------------------------ | ----------- | --------------------- | -------------------- | ------------------------ |
| `public/assets/backgrounds/bg-propose.jpg` | `bgPropose` | 야경이 보이는 호텔 뷰 | JPEG q75~85, 640×480 | `propose` 엔딩 컷신 배경 |

> 기존 게임 배경(`bg-1.jpg`~`bg-10.jpg`)과 동일 폴더. `assets/backgrounds.ts`의 `GAME_BGS`와 별도 키로 등록.

---

## PIL 처리 패턴 (참고)

```python
# 풀바디 (chi-{id}-full, cat-{id}-full, chi/cat-{id}-kissing)
edges_flood_fill(mode='light' or 'dark', threshold=230 or 20)
crop_to_content()
letterbox_to_square(256, pad_ratio=0.05)
PNG optimize=True

# 오브젝트 (chi-{id}-object)
edges_flood_fill(...)
resize to 128×128
PNG optimize=True
```

⚠️ `chihuahua.png` 본체와 `chi-{id}-full.png`은 동일 letterbox 규약 필수.
⚠️ 흰배경 흰 부분(뼈 하이라이트, 눈 흰자) 보존 위해 **edge-only flood-fill** — whole-image 제거 금지.
⚠️ 검정 배경 자산(`shades`, `rose`, `cat-propose-kissing`)은 `mode='dark'` threshold≈20.
⚠️ kissing 자산도 full과 동일 letterbox 규약 — idle↔kissing 전환 시 캐릭터 위치/크기 튀지 않게 정렬 필수.
