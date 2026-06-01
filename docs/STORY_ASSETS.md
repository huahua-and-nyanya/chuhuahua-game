# STORY_ASSETS.md — 코스튬 스토리 컷신 신규 자산 명세

> `propose` 코스튬 스토리(LV10 도달 컷신) 구현에 필요한 신규 제작 자산 목록.
> `STORY_HANDOFF.md` / `ENDING_SPEC.md`와 함께 참조. 자산 제작은 휘게 담당.
> 작성 시점: 코스튬 스토리 사이클 시작 직후.

---

## 총 13개 (데이트룩 8 + propose 정장 4 + 컷신 배경 1)

### 공통 규격 (CLAUDE.md 자산 정책)

- 스프라이트(PNG): 256×256 정사각, 투명 배경, `optimize=True`
- 파일명 kebab-case / 코드 키 camelCase, lookup 테이블(`src/assets/characters.ts`)에서 매핑
- 흰 배경 제거: 가장자리 flood-fill (THRESHOLD=235 + RGB 동일성)
- 데이트룩/정장 8·4장은 대응 베이스 스프라이트를 레퍼런스로 동일 포즈·표정 골격 유지 (상태 전환 자연스럽게)
- 코드는 경로/키만 맞추고 `onError` 폴백 처리

---

## A. 데이트룩 스프라이트 (8장) — LV1~9 플레이용

위치: `public/assets/characters/`

`propose` 착용 시 LV1~9 동안 츄/냐 **둘 다** 데이트룩으로 플레이. 플레이 중 나오는 모든 상태 스프라이트를 데이트룩 버전으로 교체 (효과 글로우/거품은 그대로 위에 얹힘).

### 츄와와 (3장)

| 파일 | 코드 키 | 대응 베이스 | 용도 |
|---|---|---|---|
| `chi-date.png` | `chiDate` | `chihuahua` | idle + 이동 |
| `chi-date-kissing.png` | `chiDateKissing` | `chihuahuaKissing` | 키스 |
| `chi-date-slow.png` | `chiDateSlow` | `chihuahuaSlow` | 슬로우(고구마) |

- `sad`는 PvP 전용 상태 → 솔로 스토리엔 안 나옴 → `chi-date-sad` 불필요
- boost(kibble)/mega는 글로우·스케일 이펙트 → 별도 이미지 불필요

### 냐냐 (5장) — 솔로에서 도달 가능한 상태 전부 대응

| 파일 | 코드 키 | 대응 베이스 | 용도 |
|---|---|---|---|
| `cat-date.png` | `catDate` | `cat` | idle + 이동 |
| `cat-date-kissing.png` | `catDateKissing` | `catKissing` | 키스 |
| `cat-date-angry.png` | `catDateAngry` | `catAngry` | 오이 가속/분노 |
| `cat-date-scared.png` | `catDateScared` | `catScared` | 비둘기 겁먹음 |
| `cat-date-shield.png` | `catDateShield` | `catShield` | fish 쉴드 |

- **`cat-date-slow` 불필요** — 솔로 sweetPotato(고구마)는 픽업자 무관하게 **츄만** 슬로우. `catSlow`는 PvP 전용 분기(`applySweetPotatoEffect('cat')`)에서만 켜지고 PvP엔 스토리 없음 → 솔로 스토리에서 고양이 슬로우 상태 도달 불가
- `cat-date-shield`는 고양이 **포즈** 이미지. 그 위에 CSS `ShieldBubble`이 그대로 얹힘 — PNG 거품 금지 규칙 유지

---

## B. propose 정장 컷신 스프라이트 (4장)

위치: `public/assets/characters/`. 컷신은 idle/walk/kiss만 쓰므로 데이트룩보다 적음.

| 파일 | 코드 키 | 용도 |
|---|---|---|
| `chi-propose-full.png` | `chiProposeFull` | 컷신 등장 / walk idle |
| `chi-propose-kissing.png` | `chiProposeKissing` | 반지 내미는 뽀뽀 |
| `cat-propose-full.png` | `catProposeFull` | 컷신 등장 idle |
| `cat-propose-kissing.png` | `catProposeKissing` | 입 가린 수줍 |

- `-full` 접미사는 **기본(idle)에만** 부여 → 옷장 메인 느낌 강조용. 키스 스프라이트는 무접미.
- `chi-propose-full` / `cat-propose-full`은 **3중 용도**:
  1. 컷신 STORY_INTRO/WALK 등장 idle
  2. 옷장/피팅룸 propose 표시
  3. **armed 아닐 때(미충족·클리어 후) propose 장착 시 LV1~9 평상 default 외형** — 옷 시스템 `equippedSrc` 자리에 propose-full 매핑 (아래 분기표 참조)
- 별도 평상 외형 스프라이트 불필요 (propose-full로 통합)

---

## C. 컷신 배경 (1장)

위치: `public/assets/backgrounds/`

| 파일 | 코드 키 | 규격 | 용도 |
|---|---|---|---|
| `bg-propose.png` | `bgPropose` | PNG, 1280×720 (기존 게임 배경과 동일 처리) | 야경 호텔 뷰 (STORY_INTRO 전환 배경) |

- 기존 게임 배경(`bg-1`~`bg-10`, `bg-space`)과 동일 규격·처리. (※ 기존 배경은 PNG — `assets_mapping_full.md`의 `.jpg` 표기는 stale, 사이클 종료 시 매핑 갱신과 함께 정정)

---

## 신규 제작 불필요 (전부 재활용)

이펙트/연출/모달은 기존 자산 조합으로 처리:

`mwah` · `kissParticles` · `kissShake` · `bgHearts` · `levelUpBurst` · `shockwave` · `FloatText` · `CenterModal` / `GameOverModal`

boost/mega/슬로우 글로우도 이펙트 레이어라 데이트룩 위에 그대로 적용.

---

## 확정 사항 (escalation 결과)

### 트리거 게이트 (armed 조건)

```
armed = equipped === 'propose'
        && rose·vacation·propose 3벌 모두 보유 (STORY_CLOTH_IDS)
        && isSolo
        && !proposeEndingCleared
```

- **재생 = 1회만**. 컷신 시청 완료 시 `proposeEndingCleared = true` → 이후 LV10 재도달해도 컷신 안 뜸.
- **스킵 없음** (1회성이라 반복 시청 고통 없음 → 스킵 버튼 미구현).
- 컷신 진입(LV10) 시 캐릭터 상태(slow/shield/angry/scared) + 게임 오브젝트(비둘기/아이템) **전부 리셋**, 캐릭터를 propose-full idle로 좌우 끝 텔레포트.

### propose 장착 시 외형/동작 분기표

| 상황 | LV1~9 default 외형 | LV1~9 상태별(kiss/slow/angry/scared/shield) | LV10 |
|---|---|---|---|
| **armed** (3벌 + propose + 미클리어) | 데이트룩 `chi-date`/`cat-date` | 데이트룩 상태 스프라이트 | 컷신 + 정장 → `proposeEndingCleared=true` → wedding 해금 |
| **미충족** (3벌 부족) | `chi-propose-full`/`cat-propose-full` | 베이스 폴백 (옷 시스템 우선순위 그대로) | 일반 플레이 |
| **클리어 후** | `chi-propose-full`/`cat-propose-full` | 베이스 폴백 | 일반 플레이 |

- **핵심**: armed 아닐 때 propose는 기존 옷 시스템처럼 동작 — `equippedSrc`(=propose-full)는 **default 상태에만** 적용, kissing/slow 등은 베이스 스프라이트로 폴백 (레퍼런스 `Chihuahua` 우선순위 `kissing > sad > slowed > equippedSrc > default`와 일관).
- 데이트룩 8장은 **armed 한 판에서만** 노출 → 클리어 후 영구히 propose-full/베이스로 복귀. 1회성 스토리 비주얼 수용 확정 (애매하면 추후 수정).

### 컷신 타이밍 (ENDING_SPEC §2 기본값 락)

| 단계 | 시간 |
|---|---|
| STORY_INTRO | 800~1200ms |
| STORY_WALK | 2500~3500ms (walk 속도 ≈0.5~0.8, dt 보간) |
| STORY_KISS | 1200~1800ms |
| STORY_JUMP | 1500~2000ms (sine y-offset 2~3회) |
| STORY_MODAL | — (입력 대기) |

---

## 자산 외 신규 (코드 작업 — 위임 대상, 참고용)

- `armed` 게이트 판정 (3벌 보유 + propose 장착 + solo + 미클리어)
- 외형 분기: armed → 데이트룩 lookup / 미충족·클리어 → propose-full(default)+베이스 폴백
- 걷기 보간 로직 (STORY_WALK, dt 기반)
- 점프 sine y-offset 로직 (STORY_JUMP)
- `storyState` 상태머신 (STORY_INTRO → WALK → KISS → JUMP → MODAL)
- LV10 진입 시 상태/오브젝트 리셋 + 정장 전환 + 배경(`bgPropose`) 전환 + HUD 페이드아웃
- 컷신 완료 시 `chuhuahua:play-stats-v1.proposeEndingCleared = true` 연결 (S+ wedding 해금)

---

## 후속 플래그 (사이클 종료 시 처리)

1. `assets_mapping_full.md` stale — 캐릭터 13개/합계 36개로 W 사이클 코스튬 미반영. 데이트룩·정장 13장 + bg-propose 포함해 일괄 갱신 필요.
2. 게임 배경 확장자: 매핑 문서 `.jpg` → 실제 `.png` 정정 (위 1번과 함께).
