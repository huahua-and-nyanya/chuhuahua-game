import { useEffect, useReducer, useRef } from 'react'

import { RENDER_FPS } from '@/game/constants'

export type GameLoopOptions = {
  // gameState === 'playing'일 때만 true. false로 토글 시 RAF 즉시 중단.
  enabled: boolean
  // 매 RAF 프레임(~60fps) 호출. dt는 ms. React state 변경 금지 — ref만 mutate.
  update: (dt: number, now: number) => void
}

// RAF 60fps로 update를 호출하면서 30fps로만 컴포넌트를 재렌더한다.
// React state를 직접 건드리지 않고 forceRender 디스패치로만 표시값을 갱신.
export function useGameLoop({ enabled, update }: GameLoopOptions): void {
  const [, forceRender] = useReducer((n: number) => n + 1, 0)

  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const lastRenderRef = useRef<number>(0)

  // update를 매 렌더마다 새 클로저로 받아도 RAF가 재시작되지 않도록 ref에 보관.
  const updateRef = useRef(update)
  useEffect(() => {
    updateRef.current = update
  }, [update])

  useEffect(() => {
    if (!enabled) return

    const renderInterval = 1000 / RENDER_FPS

    // 토글 직후 첫 프레임에서 lastTime을 now로 정렬해 dt 폭주 방지.
    lastTimeRef.current = 0
    lastRenderRef.current = 0

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now
        lastRenderRef.current = now
      }
      const dt = now - lastTimeRef.current
      lastTimeRef.current = now

      updateRef.current(dt, now)

      if (now - lastRenderRef.current >= renderInterval) {
        lastRenderRef.current = now
        forceRender()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimeRef.current = 0
      lastRenderRef.current = 0
    }
  }, [enabled])
}
