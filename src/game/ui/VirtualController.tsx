import { useCallback, useRef } from 'react'

import type { VirtualInputState } from '@/game/ai/chi-input'

import { VirtualDpad } from './VirtualDpad'
import { VirtualPad } from './VirtualPad'
import type { Direction } from './virtual-types'

// 모바일 가상 컨트롤러 — WASD 원형(좌) + 십자 D-pad(우) 묶음.
// 두 패드의 같은 방향 버튼이 같은 누적 state 갱신 (예: W 누름 + ▲ 누름 → up 유지).
// 부모(solo.tsx)는 onInputChange 콜백으로 매 변경 시 4방향 boolean 받아 useChiInput에 주입.
//
// 컨테이너: 흰 카드 + ink-base 보더 + 평면 그림자. 모바일에서 카드 아래 fixed로 노출.
// 데스크탑 노출 분기는 부모(solo.tsx)가 isMobile로 결정.

// viewport 하단 fixed — 카드 layout과 무관 (solo가 카드 외부에 그릴 수 있는 가장 단순한 방법).
// 좌우 inset-md(12px), bottom-md(12px), max-w-frame(640) 제한 + 중앙 정렬.
const CONTAINER_CLASSES =
  'fixed inset-x-md bottom-md mx-auto max-w-frame z-20 ' +
  'flex items-center justify-between gap-md px-lg py-xl ' +
  'bg-bg-card border-2 border-ink-base rounded-lg shadow-card ' +
  'select-none'

export type VirtualControllerProps = {
  onInputChange: (input: VirtualInputState) => void
}

export function VirtualController({ onInputChange }: VirtualControllerProps) {
  // 누적 state는 ref — 매 press/release 시 React state 갱신 없이 외부 콜백으로만 통보.
  const stateRef = useRef<VirtualInputState>({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const press = useCallback(
    (dir: Direction) => {
      stateRef.current[dir] = true
      onInputChange({ ...stateRef.current })
    },
    [onInputChange],
  )
  const release = useCallback(
    (dir: Direction) => {
      stateRef.current[dir] = false
      onInputChange({ ...stateRef.current })
    },
    [onInputChange],
  )

  return (
    <div className={CONTAINER_CLASSES}>
      <VirtualPad onPress={press} onRelease={release} />
      <VirtualDpad onPress={press} onRelease={release} />
    </div>
  )
}
