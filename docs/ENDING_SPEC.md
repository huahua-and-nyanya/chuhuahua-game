# ENDING_SPEC.md — 코스튬 엔딩 컷신 명세

> S/S+ 등급 일부 코스튬에 부여되는 **엔딩 시퀀스** 명세.
> 솔로 모드에서 특정 코스튬 착용 + LV10 도달 시 컷신 재생 → 보상 해금.
> 구현은 사이클 W 후반 또는 별도 사이클 E. 이 문서는 구현 참조용.

## 갱신 이력

- **v1** (2026-05-30): `propose` 엔딩 신설.
- **v2** (2026-05-30): 웨딩 해금 조건 확정 — 엔딩 씬 시청 단일 조건으로 통일. `proposeEndingCleared` 키 확정.
- **v3** (2026-05-30): 엔딩 전용 배경 자산 확정.

---

## 1. 엔딩 시스템 개요

### 트리거 조건 (AND)
- 모드: **솔로** (엔드리스). PvP/멀티 제외.
- 착용 코스튬에 `endingId` 필드 존재.
- **그 세션에서 LV10(MAX_LEVEL) 최초 도달.**
- 해당 엔딩 미시청 or 재시청 허용 (정책 미정 — 일단 매번 재생 가정).

### 능력치 효과와 분리
- 엔딩은 `ClothEffects`(능력치)와 **별개 레이어**.
- `endingId`는 단순 마커. 컷신 로직은 별도 엔딩 매니저/상태머신이 담당.
- 코스튬 효과(`catSpeedMul` 등)는 LV1~9 평소처럼 적용. LV10 진입 순간 컷신 모드로 전환되며 효과 무의미해짐.

### LV9 → LV10 스킨 노출 규칙 (propose 기믹)
- ⚠️ `propose` 착용 시: **LV1~9 동안은 기본 스킨**으로 플레이 (propose 외형 숨김).
  - 능력치 효과(`catSpeedMul:0.7`, `pigeonSpawnMul:1.7`)는 적용되지만 외형은 기본.
- **LV10 도달 순간** propose 스킨 등장 + 배경 전환 + 컷신 시작.
- 이 "LV9까지 외형 숨김" 규칙이 다른 엔딩 코스튬에도 공통인지는 미정 (propose 한정으로 일단 명세).
  - 메타에 `hideUntilEnding?: boolean` 같은 플래그 후보. 사이클 W에서 결정.

---

## 2. `propose` 엔딩 시퀀스

### 흐름 요약
```
playing (LV10 도달 감지)
  → ENDING_INTRO   배경 전환 + 캐릭터 좌우 끝 배치 + 입력 차단
  → ENDING_WALK    츄가 매우 느린 속도로 냐 향해 토독토독 이동
  → ENDING_KISS    충돌 시 kissing 스프라이트 + mwah/kissParticles
  → ENDING_JUMP    둘이 폴짝폴짝 + bgHearts 폭발
  → ENDING_MODAL   웨딩룩(S+) 해금 모달 (게임오버 모달 재활용)
```

### 상태별 상세

#### ENDING_INTRO (약 800~1200ms)
- 배경 페이드 전환 → `bg-propose.jpg` (야경이 보이는 호텔 뷰). 코드 키: `bgPropose`.
- 모든 게임 오브젝트 정리: 비둘기/아이템/디버프 제거, 스폰 중단.
- 입력 차단 (키보드/터치 무시).
- 캐릭터 텔레포트:
  - 츄와와 → 화면 **왼쪽 끝** (예: x ≈ 60, y ≈ H/2)
  - 냐냐 → 화면 **오른쪽 끝** (예: x ≈ W-60, y ≈ H/2)
  - 둘 다 `propose` idle 스프라이트 (`chi-propose-full`, `cat-propose-full`).
- HUD 페이드아웃 (점수/콤보/레벨 숨김).

#### ENDING_WALK (약 2500~3500ms)
- 츄와와가 냐냐 향해 **매우 느린 속도**로 이동 (토독토독).
  - 평소 MAX_SPEED 3.4 → 엔딩 walk 속도 ≈ 0.5~0.8 정도.
  - dt 기반 보간 권장 (프레임 독립).
- 냐냐는 제자리 (idle), 살짝 두근거리는 bob 정도.
- 걷는 동안 작은 하트 간헐 스폰 (FloatText/bgHearts 약하게).
- 츄가 냐 근처 KISS_DIST(42) 도달하면 → ENDING_KISS.

#### ENDING_KISS (약 1200~1800ms)
- 스프라이트 교체:
  - 츄 → `chi-propose-kissing` (반지 내미는 뽀뽀 모션).
  - 냐 → `cat-propose-kissing` (입 가린 수줍 모션).
- 이펙트 재활용:
  - `mwah` 텍스트, `kissParticles`, `kissShake` (화면 흔들림).
  - 볼하트 (cat-kissing 자산에 이미 포함된 연출 + 추가 파티클).

#### ENDING_JUMP (약 1500~2000ms)
- 둘이 나란히 **폴짝폴짝** (sine 기반 y 오프셋 점프 반복, 2~3회).
- `bgHearts` 대량 폭발 + `levelUpBurst` 류 골드/핑크 파티클.
- shockwave 1회 가능.

#### ENDING_MODAL
- **웨딩룩(S+) 해금 모달** 표시. 게임오버 모달(`GameOverModal`/`CenterModal`) 구조 재활용.
- 내용:
  - 타이틀: "💍 프로포즈 성공!" (가칭)
  - 서브: "웨딩 룩이 해금되었습니다"
  - 점수/도달 레벨 요약 (선택).
  - 버튼: [메인으로] / [다시 하기] 등 게임오버 모달과 동일.
- **해금 처리 확정:** 엔딩 씬 시청 완료 시 `chuhuahua:play-stats-v1.proposeEndingCleared = true` 기록.
  이후 가챠 풀에 `wedding` 추가됨. 기타 조건 없음.

---

## 3. 재활용 자산 (신규 제작 최소화)

| 재활용 | 출처 |
|---|---|
| `mwah` 텍스트 | 기존 키싱 이펙트 |
| `kissParticles` | 기존 |
| `kissShake` (화면 흔들림) | 기존 |
| `bgHearts` | 기존 |
| `levelUpBurst` | 기존 레벨업 연출 |
| `shockwave` | 기존 |
| `FloatText` | 기존 |
| `CenterModal` / `GameOverModal` | 기존 모달 |

### 신규 필요

| 자산/로직 | 상세 |
|---|---|
| 엔딩 배경 | `public/assets/backgrounds/bg-propose.jpg` — 야경이 보이는 호텔 뷰. 코드 키: `bgPropose`. 규격: JPEG q75~85, 640×480 또는 16:9. |
| 걷기 보간 로직 | ENDING_WALK — dt 기반 |
| 점프 애니 로직 | ENDING_JUMP — sine y-offset |
| 엔딩 상태머신 | `endingState` enum + RAF 타이머 기반 전이 |
| LV9까지 외형 숨김 | `hideUntilEnding` 분기 |

---

## 4. 구현 위치 제안 (사이클 W/E)

- 엔딩 상태머신: `game/` 루프 내 `endingState` ref + RAF 타이머.
- 트리거 감지: 레벨업 처리에서 `level === MAX_LEVEL && equippedHasEndingId && isSolo`.
- 컷신 중 일반 게임 로직(AI/충돌/스폰) 전부 일시정지.
- 모달: 기존 게임오버 모달 컴포넌트에 `variant: 'ending'` prop 추가 검토.

---

## 5. 향후 엔딩 코스튬

- 현재: `propose` (S) → 웨딩룩 해금.
- S+ `wedding`: 자체 엔딩 보유 가능 (사이클 E). `triggerEnding` 필드.
- 다른 S 옷에 엔딩 추가 시 `endingId` 부여 + 이 문서에 시퀀스 추가.
