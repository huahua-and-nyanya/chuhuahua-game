# 츄와와 게임 — CLAUDE.md

> 츄와와가 도망가는 고양이에게 뽀뽀하는 브라우저 게임. 솔로 엔드리스 + 로컬/온라인 PvP + 옷장/가챠/랭킹.

---

## 일정 (공모전)

- **5월 26일 오전 10시** — 기획서 PDF 제출
- **6월 8일 오전 10시** — 배포 URL + GitHub 링크 + 시연영상(YouTube) 제출

오늘 5월 13일 기준 4주.

---

## 게임 개요

| 요소   | 내용                                                             |
| ------ | ---------------------------------------------------------------- |
| 제목   | 츄와와 ~뽀뽀 돌격~ (en: chuhuahua-game)                          |
| 한 줄  | 뽀뽀하려는 츄와와 vs 죽어도 싫은 고양이. 비둘기도 자꾸 끼어든다. |
| 플랫폼 | 웹 브라우저 (PC 우선, 모바일 추후 대응)                          |

### 모드

- **솔로 엔드리스** — 속도 무한 증가, 맵 무제한. 비둘기 회피. 점수/코인 누적.
- **로컬 PvP** — 한 키보드 2인 (WASD + 방향키). 비둘기 비활성.
- **온라인 랜덤 매칭** — 최대 3분 대기, 실패 시 메인 또는 AI 봇.
- **온라인 방 매칭** — 방 만들기 / 입장 / 초대 링크.

### 메타 진행

- 익명 로그인 (Supabase Anonymous Auth, 첫 진입 시 자동)
- 코인 누적 — 솔로 엔드리스에서만
- 옷 가챠 — 코인 소모, 등급별 확률 공개, 천장 시스템
- 옷 효과 — 외형 + 솔로 스킬. PvP 적용은 후속 결정.
- 전체 랭킹 (Supabase) + 내 로컬 기록 별도

---

## 약관 대응 (실격 방지)

모든 PR에서 다음 확인:

- 회원가입 / 본인인증 / 결제 / 광고 X
- "데이팅 / 매칭 서비스" 인상 회피 — UI 문구는 게임 어휘만 ("대전 상대", "랜덤 매치"). 금지: "운명", "마음에 드는", "이상형" 등
- 가챠 사행성 회피 — 확률 공개, 천장 시스템, "잭팟" 연출 X
- 폭력성/선정성 회피 — 거부 연출도 코미디 톤
- 백엔드 다운 대비 — Supabase 실패해도 로컬 모드는 동작해야 함 (오프라인 폴백)
- Chrome / Edge / Safari / Firefox 정상 동작

---

## 목표 우선순위 (충돌 시 위쪽 우선)

1. **약관 준수** — 위 체크리스트 위반 즉시 실격
2. **사용자 경험** — 시각 일관성, 60fps, 입력 반응성, 게임 즉시 진입
3. **모듈 경계** — game / modes / features / backend 분리 유지
4. **코드 단순성** — 오버엔지니어링 회피, 추상화는 두 번째 사례부터
5. **배포 안정성** — 빌드 / 타입체크 통과

---

## 기술 스택

- 빌드/런타임: **Vite + React + TypeScript**
- 라우팅: **TanStack Router** (file-based, `@tanstack/router-plugin/vite`)
- 스타일: **Tailwind CSS v4** (preflight reset 자체 내장)
- 포맷: **Prettier** + `prettier-plugin-tailwindcss`
- 린트: **ESLint** (Vite 기본 + `eslint-config-prettier`)
- 패키지 매니저: **pnpm**
- 백엔드: **Supabase** (PostgreSQL + Anonymous Auth + Realtime + RLS)
- 배포: **Vercel** (예정)
- path alias: `@/` → `src/`

---

## 디렉터리 구조

```
src/
  routes/        # TanStack Router file-based (얇게, 진입점만)
  game/          # 게임 코어 (백엔드 무관, 순수 로직)
    characters/  # Chihuahua, Cat, Pigeon
    items/       # Kibble, Cucumber, Fish, SweetPotato
    skills/      # 옷 스킬 정의
  modes/         # 모드별 묶음
    endless/     # 솔로 엔드리스
    local-pvp/   # 로컬 PvP
    online-pvp/  # 온라인 PvP (랜덤/방 공용)
  features/      # 기능 단위 (백엔드 의존)
    auth/        # 익명 로그인
    wardrobe/    # 옷 인벤토리
    gacha/       # 가챠
    coins/       # 코인
    leaderboard/ # 전체 랭킹
    history/     # 로컬 기록
    matchmaking/ # 랜덤 매칭
    rooms/       # 방 매칭
  backend/       # Supabase
    queries/     # 테이블별 쿼리 함수
    realtime/    # Realtime 구독
  ui/            # PixelButton/Card/Chip, CenterModal, NavButton 등
  hooks/         # useGameLoop, trackedTimeout, useInput
  lib/           # math, storage 등 순수 유틸
  styles/        # tokens.css, globals.css
  assets.ts      # 자산 경로 lookup
public/assets/   # characters / items / effects / clothes
public/fonts/    # moneygraphy.woff2
docs/            # assets-guide.md, schema.md, adr/
supabase/        # CLI migrations (선택)
```

### 경계 원칙

- `game/` = 백엔드 모름, 순수 로직
- `modes/` = `game/`을 묶어 모드 단위 컴포넌트
- `features/` = 백엔드 / 부가 기능. 컴포넌트는 `backend/` 직접 import 금지 → 항상 `use*` hook 경유
- `routes/` = 진입점만, 실제 UI는 `modes/` / `features/`에서 import
- `routes/-components/` = `-` 접두 → 라우트로 등록 안 됨, 라우트 공용 컴포넌트 co-locate 용

---

## Tone & Prohibitions

**적용 범위**: 코드, 주석, 문서, **커밋 메시지, PR 본문** 모두.

### 어휘 / 톤

- "필요" → "이용 / 활용 / 쓰임"
- 과장·단정 어휘 금지 — 혁신적, 뛰어난, 강력한, 완벽한, 멋진 등
- 응원·칭찬 과잉 금지 — 잘했어요, 훌륭합니다, 좋은 질문입니다 등
- 부드러운 단언 금지 ("~인 것 같습니다", "~일 수 있습니다" 식의 약화된 확신)
- 한국어 간결 톤, 결론 → 근거 순
- 커밋·주석은 반말 OK. 제출 문서(기획서, README 외부 안내문)는 존댓말.

### 금지 사항

- **이모지·이모티콘 금지** — 코드, 문서, 커밋, PR 모두
- **커밋 메시지에 `Co-Authored-By: Claude` 트레일러 금지**
- **커밋 메시지에 "🤖 Generated with Claude Code" 등 자동 푸터 금지**
- 한 커밋에 여러 변경 섞기 금지 (Git 섹션 참조)
- `cd && git ...` 식 디렉터리 이동 후 git 명령 금지 (실수 방지 — 항상 저장소 루트에서 실행)

---

## 운영 규율 (편향 차단 4종)

1. AI 산출물을 1차 자료로 인용 금지 — 라이브러리 동작은 공식 문서 또는 소스 직접 확인
2. 가설 확정 시 `node_modules` grep 또는 GitHub 저장소 직접 확인
3. 자료 / 실 자산 / 타입 정의 3중 cross-check
4. 타입과 스키마(Supabase 테이블 / Zod) 항상 같이 변경

---

## 작업 사이클

한 사이클 = 한 PR.

```
범위 확정 → 위임 프롬프트(검증 시나리오 사전) → AI 작업
        → 시각·기능 검증 → PR → 머지(feat/* → dev, squash)
```

- 한 사이클에서 게임 로직 / 시각 / 자산 / 빌드를 동시에 건드리지 않음
- 종료 후 발생한 결함은 다음 사이클의 검증 시나리오로 흡수

---

## Git

### 브랜치 / 머지

- `main` — 배포 가능 상태. 6/8 직전 dev → main 머지.
- `dev` — 통합 브랜치. PR base.
- `<태그>/<scope>` — 작업 브랜치 (feat, fix, chore, docs, refactor, perf, style, test)
- PR 머지는 **Squash and merge** (feat/\* → dev). main 머지만 일반 merge commit 허용.

### Commit Convention (형식)

- 형식: `태그: 설명`
- 설명은 **한국어 OK, 50자 이내**
- 본문은 "왜"가 자명하지 않을 때만 작성 (한 줄 비우고 작성)
- 마침표 X

| 태그       | 용도                     |
| ---------- | ------------------------ |
| `feat`     | 새 기능 추가             |
| `fix`      | 버그 수정                |
| `refactor` | 동작 변경 없는 코드 개선 |
| `style`    | 포맷팅 등 비기능 변경    |
| `chore`    | 빌드·설정·패키지 관리    |
| `docs`     | 문서만 변경              |
| `test`     | 테스트 추가·수정         |
| `perf`     | 성능 개선                |

예시:

- `feat: 솔로 엔드리스 모드 난이도 곡선 적용`
- `fix: PvP 쉴드 막힘 시 슬픈 표정 미발동 수정`
- `chore: pnpm으로 의존성 재설치`
- `refactor: 게임 코어 로직을 src/game으로 분리`

### Commit 규칙 (운영)

- **단계별로 커밋** — 하나의 논리 단위(파일 생성, 기능 구현, 설정 변경)마다 커밋
- 여러 변경이 섞인 채 커밋 금지. 작업 도중에도 중간 커밋
- 타입체크·빌드·린트 실패 상태 커밋 금지
- 커밋 단위 = 머지 후 squash로 사라지지만, 진행 중 되돌리기 / 부분 revert에 의미 단위 분리가 필요함

---

## 스타일 정책 (강제)

- **색상 / 간격 / 폰트 / 그림자 등은 모두 토큰으로 정의** — Tailwind `theme` 또는 CSS 변수
- **컴포넌트 코드에 색상 하드코딩 금지** — `#FFFFFF`, `rgba(0,0,0,.5)` 같은 리터럴 X
  - 인라인 style이 필요한 경우에도 `var(--token-name)` 형태로 변수 참조
  - 예외 없음 — 게임 wrapper / 캐릭터 transform 등 동적 계산도 변수 사용
- **Tailwind 클래스로 표현 가능한 건 클래스 우선**
- **Tailwind로 어려운 영역** (게임 wrapper, 캐릭터 transform, 키프레임 애니메이션) — CSS Module 또는 인라인 style 허용. 단 색상은 변수 참조.
- 토큰 정의 위치:
  - Tailwind v4: `src/styles/globals.css`에 `@theme` 블록
  - 추가 변수: `src/styles/tokens.css`
- 토큰 이름은 의미 기반 (`--color-bg-primary`, `--color-text-muted`), 색상 값 기반(`--pink-500`) X

---

## 컴포넌트 분리 원칙

- 화면 컴포넌트(라우트 / 모드)는 **200줄 이하 권장**
- 분리 기준:
  - 시각적으로 구분되는 영역 (헤더, 사이드바, 결과 모달)
  - 재사용 가능한 위젯 (캐릭터 카드, 점수 표시, 닉네임 입력 모달)
  - 자체 상태/로직 가지는 부분 (입력 폼, 가챠 연출)
- 분리한 컴포넌트 위치:
  - **한 곳에서만 쓰임** → 라우트 폴더 옆 `-components/` 또는 모드 폴더 내 co-locate
  - **두 곳 이상에서 쓰임** → `ui/` (디자인 단위) 또는 `features/<feature>/` (도메인 단위)로 승격
- 승격 기준: 두 번째 사용 사례가 생긴 시점 (운영 규율 "추상화는 두 번째 사례부터")
- **재사용 가능한 공통 후보**: `PixelButton`, `PixelCard`, `PixelChip`, `CenterModal`, `NavButton`(페이지 전환), `NicknameModal`, `ResultModal`, `LoadingSpinner`

---

## 플랫폼 / 입력 추상화

- **현재**: 데스크탑 / 노트북 우선 (Chrome 최적화)
- **향후**: 모바일 대응 — 게임보이 스타일 UI
  - 화면 하단에 십자키(D-pad) + A/B 버튼 오버레이
  - 키보드 입력 핸들러 → 가상 컨트롤러 입력으로 분기
  - 터치 이벤트 → 키 매핑 (위/아래/좌/우/A/B)

### 입력 추상화 (셋업 시점부터 적용)

게임 로직은 입력 출처와 무관하게 동작하도록 첫 빌드부터 분리:

```ts
// src/hooks/useInput.ts
// 키보드 / 가상 컨트롤러 / (추후) 게임패드를 같은 인터페이스로 노출
type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
};
```

- 게임 로직은 `InputState`만 받음. 키보드 직접 참조 금지.
- 솔로/로컬 PvP에선 키보드, 모바일에선 가상 컨트롤러가 같은 `InputState` 채움.

---

## React 게임 패턴

- 게임 객체는 `useRef`. React state는 표시값만.
- 30fps 렌더는 `useReducer forceRender`, RAF는 60fps.
- 모든 `setTimeout`은 `trackedTimeout`으로 cleanup (메모리 누수 방지).
- 파티클은 상한(`MAX_PARTICLES`) + 인플레이스 변경.
- **CSS `@keyframes`의 속성은 inline style을 매 프레임 덮어쓴다** — opacity 안 먹히면 keyframes 의심.
- 캐릭터 컨테이너는 `width/height` + `display:flex` + `align/justify center` 필수 — 빠뜨리면 우측 끝에서 절반 크기.
- `imageRendering: 'pixelated'`를 게임 wrapper에 적용 금지 — 일러스트 흐려짐.

---

## 자산 관리

- 모든 이미지/폰트는 **`public/assets/`** 정적 파일. base64 인라인 금지.
- 파일명: **kebab-case** (`chihuahua-kissing.png`). 코드 키는 camelCase, lookup 테이블(`src/assets.ts`)에서 매핑.
- 캐릭터: **256×256 정사각 PNG**, `optimize=True`. 비정사각은 letterbox.
- 배경/타이틀: JPEG q78~85, ~700px.
- 흰 배경 제거: 가장자리 flood-fill (THRESHOLD=235 + RGB 동일성). 전체 적용 시 디테일 손상.
- 자세한 권장은 `docs/assets-guide.md` 참조.

---

## 백엔드 (Supabase) 정책

- **익명 로그인 자동** — 첫 진입 시 백그라운드 처리, 사용자 인지 없음
- **세션 토큰**은 Supabase SDK가 localStorage에 자동 보존 → 직접 저장 X
- **닉네임만 localStorage 별도 캐시** (`chuhuahua:nickname`)
- **컴포넌트는 `backend/` 직접 import 금지** — 항상 `features/<X>/use<X>.ts` hook 경유
- **RLS 필수** — 모든 테이블에 정책. 자기 데이터만 읽기/쓰기.
- **랭킹 점수는 서버 검증** — Edge Function 또는 RPC. 클라이언트 직접 INSERT 금지 (조작 방지).
- **오프라인 폴백** — Supabase 실패해도 `/solo`, `/multi/local`은 동작해야 함.

---

## 닉네임 UX

- **첫 진입**: 닉네임 요청 안 함. 게임 즉시 진입.
- **솔로 엔드리스 게임 오버**: 모달로 닉네임 요청. 입력 → 랭킹 등록 / 건너뛰기 → 스킵.
- **온라인 PvP 진입**: 닉네임 모달. 입력 → 그 닉네임 / 건너뛰기 → `익명_xxxx` 자동.
- 한 번 입력하면 localStorage 저장, 다음부터 모달 기본값으로.

---

## 기존 코드 리팩토링 컨텍스트

**게임 로직 / 자산 / 캐릭터 상태 / 아이템 효과 / 메커니즘 관련 작업 시 본 reference 파일을 1차 자료로 참조한다.** 작업 전 해당 부분을 `grep` 또는 파일 검색으로 찾아 기존 동작을 먼저 파악한 후 진행한다. 추측으로 재구현 금지 — 휘게가 검증한 패턴(캐릭터 상태 우선순위, 아이템 효과 분기, CSS 키프레임 분리 등)이 1차 자료다.

- **참조 파일**: `reference/ChihuahuaCatKissGame.txt` (저장소 루트 기준, 약 3,580라인 1.5MB). 게임 로직 + 모든 자산(base64 인라인) + UI + 스타일이 한 파일에 있음. `.gitignore`에 포함되어 원격엔 안 올라감.
- **리팩토링 방향**: 그대로 옮기지 말고 본 문서 정책에 맞게 재구성.
  - 자산: base64 → `public/assets/` 정적 파일로 추출 (kebab-case)
  - 게임 로직: `game/` 모듈로 추출 (캐릭터, 아이템, 물리, 효과, 상수)
  - UI: Tailwind + 토큰 변수로 재작성. 인라인 hex / rgba 금지.
  - 입력: `hooks/useInput.ts` 추상화 거쳐 게임 로직에 전달
  - 모드: 솔로/PvP를 `modes/` 하위로 분리 (현 코드는 한 컴포넌트에 분기 박혀있음)
- **단계적 마이그레이션** — 한 사이클에 한 영역. 빅뱅 리팩토링 금지.
- **기존 동작 보존** — 캐릭터 상태 전환 우선순위, 아이템 효과 분기(picker), CSS 키프레임 분리(bubble-pulse / shield-pulse) 등 휘게가 검증한 패턴은 그대로 유지.

---

## 위임 프롬프트 패턴

- 검증 포인트를 작업 **전에** 적음 — "변경 후 다음 N개 시나리오에서 작동"
- 옵션 분기는 plan 단계에서 A/B/C 명시 → 사용자 plan 승인 = 옵션 채택 동의
- 시각 검증 진실 출처(캐릭터 크기 기준, 키프레임 동작 등)는 프롬프트 상단에
- 금지 사항(Co-Authored-By, "🤖 Generated with Claude Code" 푸터, `cd && git`, 한 커밋 섞기)을 위임 시 매번 명시 X — 본 문서 `Tone & Prohibitions` 섹션이 표준
