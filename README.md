# 츄와와 ♥ 뽀뽀 돌격 ♥

<div align="center">
  <img width="2400" height="1792" alt="츄와와 메인" src="https://github.com/user-attachments/assets/0ed8d800-f38c-4ee1-97e2-b3d75c937c0f" />
  <h3><i>츄와와의 일편단심 뽀뽀 대작전. 냐냐의 마음을 사로잡을 수 있을까?</i></h3>
</div>

---

## 기본 정보

| 항목                | 내용                                                             |
| ------------------- | ---------------------------------------------------------------- |
| **제목**            | 츄와와 뽀뽀 돌격                                                 |
| **영문 작업명**     | chuhuahua-game                                                   |
| **한 줄 소개**      | 츄와와의 일편단심 뽀뽀 대작전. 냐냐의 마음을 사로잡을 수 있을까? |
| **장르**            | 추격·회피 액션, 캐주얼 아케이드                                  |
| **플랫폼**          | 웹 브라우저 (Chrome, Edge, Safari, Firefox)                      |
| **진입 방식**       | 별도 설치 및 회원가입 없음. URL 접속만으로 즉시 실행             |
| **플레이 인원**     | 1인(솔로) / 2인(로컬 PvP, 단일 키보드)                           |
| **1판 플레이 시간** | 30초 ~ 3분, 누적 플레이 시간 무제한                              |

## 게임 소개

귀여운 강아지 츄와와가 도망가는 고양이 냐냐를 쫓아가 뽀뽀를 성공시키는 추격·회피 게임입니다. 냐냐는 츄와와가 가까워지면 달아나고, 츄와와는 점점 빨라지며 등장하는 아이템을 활용합니다. 솔로 모드에서는 비둘기가 끼어들어 변수를 만듭니다.

게임 화면은 두 가지 모드로 나뉩니다.

### 혼자서 모드 (솔로 엔드리스)

- **조작**: WASD 또는 방향키로 츄와와 이동. 스페이스바로 시작
- **목표**: 뽀뽀로 점수를 쌓아 LV 1에서 LV 10까지 도달
- **변수**: 시작 약 13초 후부터 비둘기가 등장. 레벨이 오를수록 더 자주, 여러 마리가 함께 나오며 빨간 경고 마커 뒤로 날아듭니다. 맞으면 게임 오버
- **메타 진행**: 솔로 모드에서만 코인이 누적되어 옷장 가챠에 쓰입니다

### 둘이서 모드 (로컬 PvP)

- **조작**: 츄와와는 WASD, 냐냐는 방향키 ↑↓←→ (한 키보드 2인)
- **목표**: 30초 안에 뽀뽀 10회를 채우면 츄와와 승, 시간이 다 가면 냐냐 승
- **시작**: 두 플레이어가 각자 키를 한 번씩 눌러 준비한 뒤 Enter 또는 시작 버튼
- 비둘기는 비활성화되고, PvP 전용 아이템이 더 자주 등장합니다

## 캐릭터와 아이템

### 캐릭터

| 캐릭터     | 역할     | 동작                                                                   |
| ---------- | -------- | ---------------------------------------------------------------------- |
| **츄와와** | 플레이어 | 가속 기반 이동. 일정 거리 안에서 냐냐에게 뽀뽀                         |
| **냐냐**   | NPC / 2P | 솔로에선 AI 추격 회피, 레벨이 오를수록 더 빠르게 도망. PvP에선 2P 조작 |
| **비둘기** | 장애물   | 솔로 한정. 경고 마커 뒤로 날아들어 맞으면 게임 오버                    |

### 아이템

| 아이템          | 효과                                                 | 등장             |
| --------------- | ---------------------------------------------------- | ---------------- |
| 사료            | 츄와와 부스트 (속도 ×1.55, 5초)                      | 솔로 / PvP       |
| 물고기          | 쉴드 부여 (비둘기·뽀뽀·디버프 1회 차단), 슬로우 해제 | 솔로 / PvP       |
| 오이            | 냐냐 가속 (×1.85, 3초)                               | 솔로 LV 3+ / PvP |
| 고구마          | 슬로우 (×0.55, 3초)                                  | 솔로 LV 3+ / PvP |
| 웨딩 아이템 3종 | 점수 ×2 / 부스트 / 냐냐 감속                         | 웨딩(S+) 장착 시 |

PvP 팁: 부스트와 슬로우는 서로 상쇄되고, 슬로우 상태에서 물고기를 먹으면 슬로우만 풀립니다.

## 옷장 / 가챠 시스템

솔로 모드에서 모은 코인으로 옷을 뽑아 외형을 꾸미고 솔로 능력치를 바꿉니다. 사행성 회피를 위해 등급별 확률을 공개하고 천장 시스템을 둡니다.

| 등급   | 라벨      | 확률 | 효과 범위             |
| ------ | --------- | ---- | --------------------- |
| **B**  | Common    | 60%  | 외형 전용             |
| **A**  | Rare      | 30%  | 능력치 1종            |
| **S**  | Epic      | 9%   | 능력치 다수 + 전 모션 |
| **S+** | Legendary | 1%   | 게임 규칙 변형        |

- **효과 필드**: 츄와와/냐냐 속도 배율, 비둘기·아이템 등장 빈도 등. 등급이 효과 개수·종류를 제한합니다 (`src/features/wardrobe/grades.ts`)
- **S+ 웨딩**: 프로포즈 엔딩 클리어 후 해금. 비둘기 비활성 + 웨딩 전용 아이템 풀로 교체되는 특수 모드
- 자세한 명세는 [docs/wardrobe_spec.md](docs/wardrobe_spec.md) 참조

## 기록과 저장

백엔드 없이 모든 데이터를 브라우저 localStorage에 저장합니다 (`chuhuahua:*` 키). 솔로 최고/최근 기록과 PvP 전적은 랭킹 페이지에서 확인합니다.

| 데이터    | 키                         |
| --------- | -------------------------- |
| 코인      | `chuhuahua:coins`          |
| 솔로 기록 | `chuhuahua:history-v1`     |
| PvP 기록  | `chuhuahua:pvp-history-v1` |
| 옷장      | `chuhuahua:wardrobe-v1`    |
| 닉네임    | `chuhuahua:nickname`       |

닉네임은 첫 진입에서 요청하지 않고 게임에 바로 들어갑니다. 솔로 게임 오버 시 모달로 입력받아 기록에 등록하며, 한 번 입력하면 다음부터 기본값으로 채워집니다.

## 기술 스택

| 범주        | 사용 기술                      |
| ----------- | ------------------------------ |
| 빌드·런타임 | Vite 8, React 19, TypeScript 6 |
| 라우팅      | TanStack Router (file-based)   |
| 스타일      | Tailwind CSS v4, CSS 토큰 변수 |
| 애니메이션  | Framer Motion, CSS keyframes   |
| 아이콘      | @tabler/icons-react            |
| 저장        | localStorage (백엔드 없음)     |
| 패키지      | pnpm                           |
| 배포        | Vercel                         |

Path alias: `@/` → `src/`

## 프로젝트 구조

```
src/
  routes/      진입점만 (solo / multi/local / wardrobe / ranking / howto / dev)
  game/        게임 코어 (저장소 무관, 순수 로직)
    characters/  Chihuahua, Cat, Pigeon
    items/       Kibble, Fish, Cucumber, SweetPotato, Wedding 3종
    ai/ collision/ loop/ progression/ story/ ui/   AI·충돌·루프·점수·컷신·게임 UI
  modes/       모드별 묶음 (endless / local-pvp)
  features/    부가 기능, localStorage 기반 (wardrobe / coins / history / pvp-history / audio)
  components/  레이아웃 (DSFrame, GameFrameCard 등)
  ui/          공용 위젯 (PixelButton/Card/Chip, CenterModal, NavButton 등)
  hooks/       useGameLoop, trackedTimeout, useInput
  lib/         순수 유틸
  styles/      tokens.css, globals.css
  assets/      카테고리별 lookup
public/assets/ characters / items / effects / clothes
docs/          명세·가이드 문서
```

경계 원칙: `game/`은 순수 로직, `modes/`는 `game/`을 묶은 모드 단위, `features/`는 localStorage 등 부가 기능(컴포넌트는 항상 `use*` hook 경유), `routes/`는 진입점만.

## 실행 방법

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속.

## 자주 쓰는 명령

| 명령                | 설명                          |
| ------------------- | ----------------------------- |
| `pnpm dev`          | 개발 서버 실행                |
| `pnpm build`        | 프로덕션 빌드 (`tsc -b` 포함) |
| `pnpm preview`      | 빌드 결과물 로컬 프리뷰       |
| `pnpm typecheck`    | TypeScript 타입체크           |
| `pnpm lint`         | ESLint 실행                   |
| `pnpm format`       | Prettier로 전체 포맷          |
| `pnpm format:check` | 포맷 위반만 확인 (CI용)       |

## 문서

| 문서                                                     | 내용                       |
| -------------------------------------------------------- | -------------------------- |
| [CLAUDE.md](CLAUDE.md)                                   | 작업 정책·구조·컨벤션 전체 |
| [docs/wardrobe_spec.md](docs/wardrobe_spec.md)           | 옷장 시스템 명세           |
| [docs/wardrobe-extension.md](docs/wardrobe-extension.md) | 옷 추가 워크플로우         |
| [docs/assets-guide.md](docs/assets-guide.md)             | 자산 추출·사이즈 규칙      |
| [docs/ENDING_SPEC.md](docs/ENDING_SPEC.md)               | 엔딩 컷신 명세             |

작업 전 [CLAUDE.md](CLAUDE.md) 정독 권장. 디렉터리 구조, 톤·금지 사항, Git 컨벤션, 스타일 정책이 거기에 정의되어 있습니다.

## 라이선스

비공개 프로젝트 (공모전 출품).
