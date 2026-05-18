# 츄와와 게임 — 자산 매핑 (전체)

> 모든 자산 파일과 코드 키, 권장 사이즈, 사용 패턴을 한 곳에. `docs/assets-guide.md`와 함께 사이클마다 참조.

---

## 개요

| 카테고리            | 개수                      | 위치                                                              |
| ------------------- | ------------------------- | ----------------------------------------------------------------- |
| 캐릭터              | 13                        | `public/assets/characters/`                                       |
| 아이템              | 4                         | `public/assets/items/`                                            |
| 아이콘              | 2                         | `public/assets/icons/`                                            |
| 메인 자산           | 2                         | `public/assets/`                                                  |
| 페이지 배경 (4계절) | 4                         | `public/assets/page-bgs/`                                         |
| 게임 배경           | 11                        | `public/assets/backgrounds/` (지구 10 + 우주 1)                   |
| 폰트                | 2                         | `public/fonts/`                                                   |
| 옷장 (옷 + UI)      | 가변                      | `public/assets/clothes/` + `ui/` + `backgrounds/fitting-room.jpg` |
| **합계**            | **38개 파일 + 옷장 자산** |                                                                   |

효과(쉴드 버블)는 PNG 자산이 아닌 **CSS 컴포넌트(`ShieldBubble`)**로 구현 — 게임 코어 사이클에서 작성.

---

## 1. 캐릭터 (13개)

위치: `public/assets/characters/`

| 파일명                  | 코드 키            | 그룹 | 상황                           | 트리거                         |
| ----------------------- | ------------------ | ---- | ------------------------------ | ------------------------------ |
| `chihuahua.png`         | `chihuahua`        | 츄   | 기본 — idle, 이동              | 다른 상태 없을 때              |
| `chihuahua-kissing.png` | `chihuahuaKissing` | 츄   | 냐냐를 키스하는 동작           | 냐냐와 충돌                    |
| `chihuahua-slow.png`    | `chihuahuaSlow`    | 츄   | 슬로우 디버프 (속도↓)          | 슬로우 상태 활성               |
| `chihuahua-sad.png`     | `chihuahuaSad`     | 츄   | 키스 실패 슬픈 표정            | (PvP) 냐냐 쉴드에 막힘 시 잠깐 |
| `chihuahua-victory.png` | `chihuahuaVictory` | 츄   | 승리 모달 일러스트             | 게임 종료 — 츄 승              |
| `cat.png`               | `cat`              | 냐냐 | 기본 — idle, 이동              | 다른 상태 없을 때              |
| `cat-kissing.png`       | `catKissing`       | 냐냐 | 츄에게 키스 당함               | 츄와 충돌                      |
| `cat-angry.png`         | `catAngry`         | 냐냐 | 가속/분노 (사이즈↑, 녹색 glow) | 오이 픽업 (`catSpeedup`)       |
| `cat-scared.png`        | `catScared`        | 냐냐 | 놀람/도망                      | 비둘기 근처 (220px, 솔로)      |
| `cat-slow.png`          | `catSlow`          | 냐냐 | 슬로우 디버프                  | 슬로우 상태 활성               |
| `cat-shield.png`        | `catShield`        | 냐냐 | 쉴드 활성                      | fish 픽업                      |
| `cat-victory.png`       | `catVictory`       | 냐냐 | 승리 모달 일러스트             | 게임 종료 — 냐냐 승            |
| `pigeon.png`            | `pigeon`           | NPC  | 적 비둘기                      | 솔로 모드 출현                 |

**우선순위 (코드 기준)**

- 츄: `kissing > sad > slowed > 기본`
- 냐냐: `kissing > shielded > slowed > angry > scared > 기본`

**권장 사이즈**: 256×256 정사각 PNG, 투명 배경, `optimize=True`

---

## 2. 아이템 (4개)

위치: `public/assets/items/`

| 파일명             | 코드 키       | 픽업   | 솔로(엔드리스) 효과              | PvP 효과                                        |
| ------------------ | ------------- | ------ | -------------------------------- | ----------------------------------------------- |
| `kibble.png`       | `kibble`      | 츄만   | 츄 부스트                        | 츄 부스트 (슬로우 활성 시 상쇄 → 평속)          |
| `cucumber.png`     | `cucumber`    | 냐냐만 | 냐냐 가속 1.85배 (츄에게 불리)   | 냐냐 가속/분노 (슬로우 활성 시 상쇄)            |
| `fish.png`         | `fish`        | 둘 다  | 츄가 먹어도 냐냐에게 쉴드 (역설) | 픽업한 쪽: 슬로우면 해제 / 아니면 쉴드 1회 부여 |
| `sweet-potato.png` | `sweetPotato` | 둘 다  | 츄 슬로우 (픽업자 무관)          | 픽업한 쪽 슬로우 (부스트 시 상쇄, 쉴드 시 차단) |

**상호작용 룰 (PvP)**

- 부스트 ↔ 슬로우 상호 상쇄: 한쪽 활성 시 반대 효과 픽업 → 양쪽 다 해제 (×1.0)
- 활성 쉴드는 디버프(고구마) 1회 차단 + 1회 소진
- 냐냐 쉴드는 츄 뽀뽀 1회 추가 차단

**권장 사이즈**: 128×128 정사각 PNG, 투명 배경

---

## 2-1. 아이콘 (2개)

위치: `public/assets/icons/`

| 파일명             | 코드 키   | 용도                                   |
| ------------------ | --------- | -------------------------------------- |
| `icon-help.png`    | `help`    | 메인 코너 아이콘 (게임 방법 모달 진입) |
| `icon-ranking.png` | `ranking` | 메인 코너 아이콘 (랭킹 모달 진입)      |

**스타일**: 픽셀 아트 PNG, 투명 배경, 256×256.

**렌더링 주의**: `IconNavButton` 컴포넌트가 `image-rendering: pixelated`로 nearest-neighbor 스케일링을 강제. 안티앨리어싱이 끼면 픽셀 경계가 흐려져 의도한 룩이 깨짐.

---

## 3. 효과 (PNG 자산 없음)

쉴드 버블은 PNG 자산 대신 **CSS 컴포넌트**로 구현. 게임 코어 사이클에서 작성:

- `src/game/characters/ShieldBubble.tsx`
- props: `owner: 'chi' | 'cat'`, `size?: number`
- CSS 라디얼 그라데이션 + `bubble-pulse` keyframes (opacity 0.3↔0.7, scale 1↔1.08, 1.2s ease-in-out infinite)
- 색상은 토큰 변수: `--color-shield-chi`, `--color-shield-cat`

기존 reference 코드는 PNG였으나 CSS로 전환 — 자산 부담 ↓, 색상/사이즈 동적 변경 자유 ↑.

향후 추가될 시각 효과(키스 시 하트 파티클, 비둘기 회피 시 깃털, 부스트 시 잔상)도 가능한 한 CSS / SVG로 구현.

---

## 4. 메인 자산 (2개)

위치: `public/assets/`

| 파일명           | 상수         | 용도                                                          | 권장 사이즈            |
| ---------------- | ------------ | ------------------------------------------------------------- | ---------------------- |
| `main-hero.png`  | `MAIN_HERO`  | 메인 화면(`/`) 풀 일러스트 (도시 배경 + 캐릭터 + 타이틀 박힘) | 1280×720 PNG           |
| `title-logo.png` | `TITLE_LOGO` | 투명 배경 타이틀 텍스트 (모달/헤더 재사용)                    | 700×500 PNG, 투명 배경 |

**`main-hero`** — 메인 페이지에서 풀 화면 또는 큰 영역으로 표시. 단독으로 게임 정체성 전달.

**`title-logo`** — 다른 배경 위에 자유롭게 얹을 수 있음. 게임 결과 모달, 헤더, 시연 영상 인트로 등 재사용 가능.

---

## 5. 페이지 배경 (4계절, 4개)

위치: `public/assets/page-bgs/`

`PAGE_BGS` 객체로 4계절 매핑. 게임 캔버스 외곽 영역(브라우저 viewport 전체)에 깔림.

| 파일명       | 키                | 적용 시기  |
| ------------ | ----------------- | ---------- |
| `spring.png` | `PAGE_BGS.spring` | 3-5월      |
| `summer.png` | `PAGE_BGS.summer` | 6-8월      |
| `autumn.png` | `PAGE_BGS.autumn` | 9-11월     |
| `winter.png` | `PAGE_BGS.winter` | 12, 1, 2월 |

**계절 분기 로직** (`src/lib/season.ts`):

```ts
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}
```

**CSS 처리 (`__root.tsx`에 적용)**:

```css
.page-bg {
  background-color: white; /* 좌우 여백용 */
  background-position: center;
  background-repeat: no-repeat;
  background-size: auto 100dvh; /* 데스크탑: 세로 fit */
  min-height: 100dvh;
}

@media (max-width: 768px) {
  .page-bg {
    background-size: cover; /* 모바일: 꽉 채움 */
  }
}
```

**권장 사이즈**: 1080×1920 또는 세로 비율 (모바일 우선), PNG

**예외**: 메인 페이지(`/`)는 `main-hero`를 absolute로 덮어 페이지 배경 가려짐.

---

## 6. 게임 배경 (11개)

위치: `public/assets/backgrounds/`

| 파일명                   | 상수            | 사용처                                    |
| ------------------------ | --------------- | ----------------------------------------- |
| `bg-1.png` ~ `bg-10.png` | `GAME_BGS[0~9]` | 솔로 레벨 1~10 / PvP 랜덤                 |
| `bg-space.png`           | `SPACE_BG`      | 솔로 레벨 11+ 고정 (우주로 날아간 츄와와) |

**선택 규칙**:

- 솔로 엔드리스:
  - 레벨 1~10: `GAME_BGS[level - 1]` (지구 동네)
  - 레벨 11+: `SPACE_BG` 고정 (우주 도달, 더 이상 지구로 안 돌아옴)
- PvP: 게임 시작 시 1회 랜덤 — `GAME_BGS[Math.floor(Math.random() * GAME_BGS.length)]` (우주 제외, 지구 배경 10개 중)

**헬퍼 함수** (`src/game/backgrounds.ts`):

```ts
import { GAME_BGS, SPACE_BG } from '@/assets'

// 솔로 엔드리스 — 레벨 1~10은 순차, 11+ 우주 고정
export function getBackgroundForLevel(level: number): string {
  if (level > GAME_BGS.length) return SPACE_BG
  return GAME_BGS[level - 1]
}

// PvP — 게임 시작 시 1회 랜덤 (지구 배경 10개 중에서만, 우주 제외)
export function getRandomBackground(): string {
  const idx = Math.floor(Math.random() * GAME_BGS.length)
  return GAME_BGS[idx]
}
```

**권장 사이즈**: 1280×720 PNG, 가로 비율

---

## 7. 폰트 (2개)

위치: `public/fonts/`

| 파일명                      | 용도                                      | 토큰             |
| --------------------------- | ----------------------------------------- | ---------------- |
| `Moneygraphy-Pixel.woff2`   | 타이틀 / 헤딩 / 강조 텍스트 / 점수 카운터 | `--font-display` |
| `Moneygraphy-Rounded.woff2` | 본문 / 버튼 / 모달 설명 / 랭킹 표         | `--font-body`    |

Pixel은 게임 픽셀 톤, Rounded는 본문 가독성 담당.

**등록 (`src/styles/globals.css`)**:

```css
@font-face {
  font-family: 'Moneygraphy Pixel';
  src: url('/fonts/Moneygraphy-Pixel.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Moneygraphy Rounded';
  src: url('/fonts/Moneygraphy-Rounded.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-display:
    'Moneygraphy Pixel', 'Pretendard', 'Apple SD Gothic Neo', system-ui,
    sans-serif;
  --font-body:
    'Moneygraphy Rounded', 'Pretendard', 'Apple SD Gothic Neo', system-ui,
    sans-serif;
}

body {
  font-family: var(--font-body);
}
```

**사용처**:

```tsx
// 타이틀 / 헤딩
<h1 className="font-display">츄와와 뽀뽀 돌격</h1>

// 본문 / 버튼 (기본값이라 별도 클래스 불필요)
<button>시작하기</button>
```

(Tailwind v4 `@theme` 키 규칙은 공식 문서 확인 후 적용.)

---

## 8. 옷장 (옷 + UI 아이콘 + 피팅룸)

옷장 시스템 풀 명세는 `docs/wardrobe_spec.md` 참조. 옷 추가 절차는 `docs/wardrobe-extension.md` 참조.

### 8.1 옷 자산

위치: `public/assets/clothes/` (평면, 등급별 폴더 없음)

| 파일명                | 사양                  | 용도                         |
| --------------------- | --------------------- | ---------------------------- |
| `chi-{id}-full.png`   | 256×256 PNG letterbox | 츄 풀바디 (피팅룸 + 게임 내) |
| `chi-{id}-object.png` | 128×128 PNG           | 옷장 그리드 아이콘           |
| `cat-{id}-full.png`   | 256×256 PNG letterbox | 페어 옷 — 냐냐 풀바디        |
| `cat-{id}-object.png` | 128×128 PNG           | 페어 옷 — 냐냐 그리드 아이콘 |

- 파일명: `{character}-{id}-{kind}.png`, `id`는 kebab-case
- 페어 옷은 `cat-*` 두 장 추가
- 본체 `chihuahua.png`와 letterbox 규약 일치 필수

### 8.2 옷장 UI 아이콘

위치: `public/assets/ui/`

| 파일 경로          | 상수                | 사양      | 용도                  |
| ------------------ | ------------------- | --------- | --------------------- |
| `coin-icon.png`    | `COIN_ICON_PATH`    | 64×64 PNG | 코인 표시 (메인/옷장) |
| `capsule-icon.png` | `CAPSULE_ICON_PATH` | 64×64 PNG | 가챠 버튼 아이콘      |

### 8.3 피팅룸 배경

위치: `public/assets/backgrounds/fitting-room.jpg`

| 상수                   | 사양                | 용도           |
| ---------------------- | ------------------- | -------------- |
| `FITTING_ROOM_BG_PATH` | JPEG q78, ~700px 폭 | 옷장 화면 배경 |

### 8.4 경로 헬퍼

`src/assets/clothes.ts` (re-export: `src/assets/index.ts`)

```ts
import {
  clothPath,
  COIN_ICON_PATH,
  CAPSULE_ICON_PATH,
  FITTING_ROOM_BG_PATH,
} from '@/assets'

clothPath('chi', 'sprout', 'full') // '/assets/clothes/chi-sprout-full.png'
clothPath('cat', 'wedding', 'object') // '/assets/clothes/cat-wedding-object.png'
```

---

## 폴더 구조 최종

```
public/
├─ assets/
│  ├─ characters/             # 13개 PNG (256×256)
│  ├─ items/                  # 4개 PNG (128×128)
│  ├─ icons/                  # 2개 PNG (256×256)
│  ├─ page-bgs/               # 4개 JPG (4계절)
│  ├─ backgrounds/            # 11개 JPG (bg-1~10 + bg-space) + fitting-room.jpg
│  ├─ clothes/                # chi-{id}-*.png / cat-{id}-*.png (가변)
│  ├─ ui/                     # coin-icon.png, capsule-icon.png
│  ├─ main-hero.png           # 메인 히어로
│  └─ title-logo.png          # 타이틀 로고
└─ fonts/
   ├─ Moneygraphy-Pixel.woff2
   └─ Moneygraphy-Rounded.woff2
```

---

## 코드 lookup 구조

```
src/assets/
├─ index.ts          # re-export
├─ characters.ts     # CHARACTER_ASSETS
├─ items.ts          # ITEM_ASSETS
├─ icons.ts          # ICON_ASSETS
├─ backgrounds.ts    # MAIN_HERO, TITLE_LOGO, PAGE_BGS, GAME_BGS, SPACE_BG
└─ clothes.ts        # clothPath, COIN_ICON_PATH, CAPSULE_ICON_PATH, FITTING_ROOM_BG_PATH
```

**`index.ts`**:

```ts
export { CHARACTER_ASSETS } from './characters'
export { ITEM_ASSETS } from './items'
export { ICON_ASSETS } from './icons'
export {
  MAIN_HERO,
  TITLE_LOGO,
  PAGE_BGS,
  GAME_BGS,
  SPACE_BG,
} from './backgrounds'
export {
  clothPath,
  COIN_ICON_PATH,
  CAPSULE_ICON_PATH,
  FITTING_ROOM_BG_PATH,
} from './clothes'
```

**사용처 import 예시**:

```ts
import { CHARACTER_ASSETS, MAIN_HERO, PAGE_BGS, GAME_BGS } from '@/assets';
import { getCurrentSeason } from '@/lib/season';
import { getBackgroundForLevel, getRandomBackground } from '@/game/backgrounds';

// 캐릭터
<img src={CHARACTER_ASSETS.chihuahuaKissing} />

// 메인 페이지
<div style={{ backgroundImage: `url(${MAIN_HERO})` }} />

// 페이지 배경 (계절 자동)
const bg = PAGE_BGS[getCurrentSeason()];

// 게임 배경
const soloBg = getBackgroundForLevel(level);
const pvpBg = getRandomBackground();
```

---

## 자산 정책 (CLAUDE.md 발췌)

- 모든 자산은 `public/assets/` 정적 파일. **base64 인라인 금지** (번들 비대화).
- 파일명: **kebab-case** (`chihuahua-kissing.png`)
- 코드 키: **camelCase** (`chihuahuaKissing`)
- lookup 테이블(`src/assets/*.ts`)에서 매핑
- PNG: 스프라이트, `optimize=True`
- JPEG: 배경, q75~85
- 흰 배경 제거: 가장자리 flood-fill (THRESHOLD=235 + RGB 동일성)

자세한 권장 크기 / 처리 패턴은 `docs/assets-guide.md` 참조.
