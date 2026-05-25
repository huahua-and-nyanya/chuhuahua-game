import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // TanStack Router 라우트 파일은 Route + 컴포넌트를 함께 export
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // 게임 라우트: refs.current를 render에서 직접 읽고 useReducer forceRender(30fps)로
    // 동기화하는 패턴이 의도된 설계 (CLAUDE.md "React 게임 패턴" 1차 자료).
    // performance.now()도 게임 타임라인 기준값으로 빈번하게 호출됨.
    files: ['src/routes/solo.tsx', 'src/routes/multi/local.tsx'],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
    },
  },
])
