import { useCallback, useRef } from 'react'

import { setVirtualInput, type VirtualInputState } from '@/game/ai/chi-input'

import { VirtualDpad } from './VirtualDpad'
import { VirtualPad } from './VirtualPad'
import type { Direction } from './virtual-types'

// 모바일 가상 컨트롤러 — WASD 원형(좌) + 십자 D-pad(우) 묶음.
// 누름/뗌 시 chi-input.ts의 module-level virtualInputRef 갱신 → applyChiPhysics가 매 프레임 읽음.
// 위치/외곽/카드 외피는 ControllerCard가 담당. 본 컴포넌트는 두 패드만 가로로 배치.
export function VirtualController() {
  // 누적 state는 ref — 매 press/release 시 React state 갱신 없이 module ref만 동기.
  const stateRef = useRef<VirtualInputState>({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const press = useCallback((dir: Direction) => {
    stateRef.current[dir] = true
    setVirtualInput({ ...stateRef.current })
  }, [])
  const release = useCallback((dir: Direction) => {
    stateRef.current[dir] = false
    setVirtualInput({ ...stateRef.current })
  }, [])

  return (
    <div className="gap-md flex w-full items-center justify-between">
      <VirtualPad onPress={press} onRelease={release} />
      <VirtualDpad onPress={press} onRelease={release} />
    </div>
  )
}
