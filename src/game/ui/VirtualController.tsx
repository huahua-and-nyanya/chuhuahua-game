import { useCallback, useEffect, useRef } from 'react'

import { setVirtualInput, type VirtualInputState } from '@/game/ai/chi-input'
import { setVirtualCatInput } from '@/game/ai/cat-input'

import { VirtualDpad } from './VirtualDpad'
import { VirtualPad } from './VirtualPad'
import type { Direction } from './virtual-types'

const EMPTY: VirtualInputState = {
  up: false,
  down: false,
  left: false,
  right: false,
}

// 모바일 가상 컨트롤러 — WASD 원형(좌) + 십자 D-pad(우) 묶음.
// catControl=false(솔로): 두 패드 모두 츄와와(setVirtualInput) — 어느 패드를 눌러도 츄 조작.
// catControl=true(PvP): WASD 패드 → 츄와와, D-pad → 고양이(setVirtualCatInput)로 분리.
// 누름/뗌 시 chi-input/cat-input의 module-level ref를 갱신 → 각 물리 함수가 매 프레임 읽음.
export function VirtualController({
  catControl = false,
}: {
  catControl?: boolean
}) {
  // 채널별 누적 state — React state 갱신 없이 module ref만 동기화.
  const chiStateRef = useRef<VirtualInputState>({ ...EMPTY })
  const catStateRef = useRef<VirtualInputState>({ ...EMPTY })

  // WASD 패드 — 항상 츄와와.
  const pressChi = useCallback((dir: Direction) => {
    chiStateRef.current[dir] = true
    setVirtualInput({ ...chiStateRef.current })
  }, [])
  const releaseChi = useCallback((dir: Direction) => {
    chiStateRef.current[dir] = false
    setVirtualInput({ ...chiStateRef.current })
  }, [])

  // D-pad — PvP면 고양이, 솔로면 츄와와.
  const pressDir = useCallback(
    (dir: Direction) => {
      if (catControl) {
        catStateRef.current[dir] = true
        setVirtualCatInput({ ...catStateRef.current })
      } else {
        chiStateRef.current[dir] = true
        setVirtualInput({ ...chiStateRef.current })
      }
    },
    [catControl],
  )
  const releaseDir = useCallback(
    (dir: Direction) => {
      if (catControl) {
        catStateRef.current[dir] = false
        setVirtualCatInput({ ...catStateRef.current })
      } else {
        chiStateRef.current[dir] = false
        setVirtualInput({ ...chiStateRef.current })
      }
    },
    [catControl],
  )

  // catControl 전환/언마운트 시 양쪽 채널 stale 입력 리셋 — 모드가 바뀌며 눌린 채 남는 것 방지.
  useEffect(() => {
    chiStateRef.current = { ...EMPTY }
    catStateRef.current = { ...EMPTY }
    setVirtualInput({ ...EMPTY })
    setVirtualCatInput({ ...EMPTY })
    return () => {
      chiStateRef.current = { ...EMPTY }
      catStateRef.current = { ...EMPTY }
      setVirtualInput({ ...EMPTY })
      setVirtualCatInput({ ...EMPTY })
    }
  }, [catControl])

  return (
    <div className="gap-xl px-md flex w-full items-center justify-between">
      <VirtualPad onPress={pressChi} onRelease={releaseChi} />
      <VirtualDpad onPress={pressDir} onRelease={releaseDir} />
    </div>
  )
}
