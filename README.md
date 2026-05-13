# 츄와와 ~뽀뽀 돌격~

뽀뽀하려는 츄와와 vs 죽어도 싫은 고양이. 비둘기도 자꾸 끼어든다. 브라우저에서 돌아가는 솔로 엔드리스 + 로컬/온라인 PvP 게임.

A browser game built with Vite, React 19, TypeScript, TanStack Router, and Tailwind CSS v4. Backend (Supabase) integration lands in a later cycle.

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

## 프로젝트 정책

작업 전 `CLAUDE.md`(저장소 루트) 정독. 디렉터리 구조, 톤 / 금지 사항, Git 컨벤션, 스타일 정책 등이 모두 거기에 정의되어 있다.

자산 추출 / 사이즈 규칙은 [docs/assets-guide.md](docs/assets-guide.md) 참조.

## 라이선스

비공개 프로젝트 (공모전 출품).
