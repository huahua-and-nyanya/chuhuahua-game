import { GAME_HEIGHT, GAME_WIDTH } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { trackedTimeout } from '@/hooks/trackedTimeout'

// reference 1074~1087: cat의 wandering 목표점을 0.6~3s 간격으로 갱신.
// 레벨이 올라갈수록 간격이 짧아져 cat 움직임이 더 잦아진다.
//   min = max(600, 1600 - level × 140) ms
//   max = max(1000, 3000 - level × 250) ms
// 실제 timeout cleanup은 호출자(useGameLoop disable / 게임 종료)가
// clearAllTrackedTimeouts로 일괄 정리한다. 본 모듈은 active 체크로 stale recurse만 차단.

export type CatTargetDeps = {
  refs: GameRefs
  getLevel: () => number
  // gameState === 'playing'에서만 true. false 되면 재귀 stop.
  enabled: () => boolean
}

// 모듈 스코프 단일 인스턴스 — spawn.ts와 동일 패턴 (사이클 C: 동시 게임 1개).
let currentDeps: CatTargetDeps | null = null

export function scheduleCatTarget(deps: CatTargetDeps): void {
  currentDeps = deps
  schedule(deps)
}

export function stopCatTargetScheduler(): void {
  currentDeps = null
}

function schedule(deps: CatTargetDeps): void {
  if (currentDeps !== deps || !deps.enabled()) return
  const lvl = deps.getLevel()
  const min = Math.max(600, 1600 - lvl * 140)
  const max = Math.max(1000, 3000 - lvl * 250)
  const delay = min + Math.random() * (max - min)
  trackedTimeout(() => {
    // 중복 인스턴스 / 게임 종료 후 timer 발화 방어.
    if (currentDeps !== deps || !deps.enabled()) return
    deps.refs.ai.catTarget = {
      x: 80 + Math.random() * (GAME_WIDTH - 160),
      y: 80 + Math.random() * (GAME_HEIGHT - 160),
    }
    schedule(deps)
  }, delay)
}
