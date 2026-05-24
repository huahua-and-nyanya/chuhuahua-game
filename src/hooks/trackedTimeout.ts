// 모든 setTimeout은 본 헬퍼를 경유한다.
// 게임 종료/언마운트 시 clearAllTrackedTimeouts()로 일괄 정리해 메모리 누수를 막는다.
// 모듈 스코프 단일 Set — 동시에 진행되는 게임은 하나라는 사이클 C 제약과 일관.

const activeTimeouts = new Set<number>()

export function trackedTimeout(fn: () => void, ms: number): number {
  const id = window.setTimeout(() => {
    activeTimeouts.delete(id)
    fn()
  }, ms)
  activeTimeouts.add(id)
  return id
}

export function clearTrackedTimeout(id: number): void {
  if (activeTimeouts.delete(id)) {
    window.clearTimeout(id)
  }
}

export function clearAllTrackedTimeouts(): void {
  for (const id of activeTimeouts) {
    window.clearTimeout(id)
  }
  activeTimeouts.clear()
}
