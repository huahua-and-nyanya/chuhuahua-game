# 자산 관리 가이드

`CLAUDE.md` "자산 관리" 정책을 풀어 적은 실무 가이드. 실제 자산 추출은 다음 사이클부터 본격화된다.

## 기본 원칙

- 모든 이미지/폰트는 `public/assets/`(또는 `public/fonts/`) 정적 파일로 둔다. base64 인라인 금지.
- 파일명은 **kebab-case** (`chihuahua-kissing.png`). 코드 키는 camelCase, lookup 테이블(`src/assets.ts`)에서 매핑.
- 자산은 git에 그대로 커밋한다 (LFS 사용 안 함). 단일 자산이 500KB를 넘는 경우 사이즈 / 포맷 재검토.

## 폴더 구조

```
public/
  assets/
    characters/   캐릭터 스프라이트 / 일러스트
    items/        아이템 (사료, 오이, 생선, 고구마 등)
    effects/      파티클, 폭발, 하트 등 효과
    clothes/      옷장 / 가챠용 의상
  fonts/          웹폰트 (.woff2)
```

## 권장 사이즈

| 종류              | 형식  | 해상도           | 메모                                     |
| ----------------- | ----- | ---------------- | ---------------------------------------- |
| 캐릭터 스프라이트 | PNG   | 256×256 정사각   | `optimize=True`. 비정사각은 letterbox    |
| 아이템 아이콘     | PNG   | 64×64 또는 96×96 | 알파 필수                                |
| 효과 (파티클)     | PNG   | 32×32 ~ 128×128  | 작은 단위로 잘게                         |
| 배경 / 타이틀     | JPEG  | 가로 ~700px      | quality 78~85                            |
| 옷                | PNG   | 256×256          | 캐릭터 위에 합성 가능한 알파 마스킹 권장 |
| 폰트              | WOFF2 | -                | `public/fonts/`. CSS `@font-face`로 등록 |

## 흰 배경 제거

가장자리 flood-fill 방식 권장 (THRESHOLD=235 + RGB 동일성). 전체 픽셀에 적용하면 디테일이 손상되니 가장자리 시드에서만 시작.

## 코드 측 lookup

`src/assets.ts`에서 camelCase 키 → 파일 경로 매핑:

```ts
// 예시 (다음 사이클에서 실제 자산과 함께 채움)
export const assets = {
  chihuahuaKissing: '/assets/characters/chihuahua-kissing.png',
  catRunningLeft: '/assets/characters/cat-running-left.png',
  kibble: '/assets/items/kibble.png',
} as const
```

게임 코드는 `assets.chihuahuaKissing` 형태로 사용. 파일명 변경 시 한 곳만 수정.

## 픽셀 아트 처리

- `imageRendering: 'pixelated'`는 픽셀 스프라이트 한정 적용. 게임 wrapper 전체에 걸면 일러스트도 흐려진다.
- 캐릭터 컨테이너는 `width/height` + `display:flex` + `align/justify center` 필수. 빠뜨리면 우측 끝에서 절반 크기로 렌더링되는 버그가 남는다 (휘게 검증).
