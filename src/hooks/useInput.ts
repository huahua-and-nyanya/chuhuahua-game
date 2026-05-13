import { useEffect, useState } from 'react'

export type InputState = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  a: boolean
  b: boolean
}

export type InputSource = 'keyboard-wasd' | 'keyboard-arrows' | 'virtual-pad'

type KeyboardSource = Exclude<InputSource, 'virtual-pad'>

const KEY_MAPS: Record<KeyboardSource, Record<string, keyof InputState>> = {
  'keyboard-wasd': {
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
    KeyF: 'a',
    KeyG: 'b',
  },
  'keyboard-arrows': {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    Slash: 'a',
    Period: 'b',
  },
}

const INITIAL_STATE: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
}

export function useInput(source: InputSource): InputState {
  const [state, setState] = useState<InputState>(INITIAL_STATE)

  useEffect(() => {
    // virtual-pad는 모바일 대응 사이클에서 터치 이벤트 매핑으로 구현
    if (source === 'virtual-pad') return

    const map = KEY_MAPS[source]

    const apply = (down: boolean) => (e: KeyboardEvent) => {
      const action = map[e.code]
      if (!action) return
      e.preventDefault()
      setState((prev) =>
        prev[action] === down ? prev : { ...prev, [action]: down },
      )
    }

    const handleDown = apply(true)
    const handleUp = apply(false)

    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [source])

  return state
}
