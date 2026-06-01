import { useCallback, useSyncExternalStore } from 'react'

import { audioManager } from './audioManager'

// 음소거 상태 구독 + 토글 노출(우상단 토글 버튼용).
// 곡 재생/전환은 audioManager 직접 호출(B2/B3) — 훅은 muted UI만 담당.
export function useAudio() {
  const muted = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getMuted,
    audioManager.getMuted,
  )

  const setMuted = useCallback((next: boolean) => {
    audioManager.setMuted(next)
  }, [])

  const toggleMuted = useCallback(() => {
    audioManager.setMuted(!audioManager.getMuted())
  }, [])

  return { muted, setMuted, toggleMuted }
}
