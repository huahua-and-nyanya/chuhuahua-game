import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Cat } from '@/game/characters/Cat'
import { Chihuahua } from '@/game/characters/Chihuahua'
import { Pigeon } from '@/game/characters/Pigeon'
import { ShieldBubble } from '@/game/characters/ShieldBubble'
import { Cucumber } from '@/game/items/Cucumber'
import { Fish } from '@/game/items/Fish'
import { Kibble } from '@/game/items/Kibble'
import { SweetPotato } from '@/game/items/SweetPotato'

import { applyChiPhysics, useChiInput } from '@/game/ai/chi-input'
import { scheduleCatTarget, stopCatTargetScheduler } from '@/game/ai/cat-target'
import { updateCatFlee } from '@/game/ai/cat-flee'
import { updatePigeons } from '@/game/ai/pigeon-fly'
import { checkKiss } from '@/game/collision/kiss'
import { checkPickups } from '@/game/collision/pickup'
import { checkPigeonHits } from '@/game/collision/pigeon-hit'
import { getBackgroundForLevel } from '@/game/backgrounds'
import {
  DEBUFF_AFTER_LV3_FIRST,
  DEBUFF_LEVEL_MIN,
  DEBUFF_STAGGER,
  MAX_TOASTS,
} from '@/game/constants'
import {
  commitPigeonAt,
  removeWarning,
  spawnItem,
  spawnPigeonWarning,
  updateBgHearts,
} from '@/game/loop/factories'
import {
  scheduleDebuffFirstSpawn,
  scheduleItemRespawn,
  startSpawnScheduler,
  stopSpawnScheduler,
  type SoloSpawnKind,
} from '@/game/loop/spawn'
import {
  createInitialState,
  expireTransients,
  type GameRefs,
} from '@/game/loop/state'
import { useGameLoop } from '@/game/loop/useGameLoop'
import { rollComboReward } from '@/game/progression/combo-reward'
import { checkLevelUp, isMilestoneLevel } from '@/game/progression/level'
import { applyScore, expireCombo } from '@/game/progression/score'
import type { ItemKind, ToastRef } from '@/game/state'

import { BgHearts } from '@/game/ui/BgHearts'
import { ComboLabel } from '@/game/ui/ComboLabel'
import { FloatTexts } from '@/game/ui/FloatText'
import { GameOverModal, type GameOverInfo } from '@/game/ui/GameOverModal'
import { HUD } from '@/game/ui/HUD'
import { LevelUpEffect } from '@/game/ui/LevelUpEffect'
import { Mwah } from '@/game/ui/Mwah'
import { Particles } from '@/game/ui/Particles'
import { PauseModal } from '@/game/ui/PauseModal'
import { Shockwaves } from '@/game/ui/Shockwaves'
import { QuitConfirmModal } from '@/game/ui/QuitConfirmModal'
import { SoloControlBar } from '@/game/ui/SoloControlBar'
import { adjustTimersByPauseDuration } from '@/game/loop/pause'
import { updateParticles } from '@/game/particles'
import { trackedTimeout } from '@/hooks/trackedTimeout'

import { useHistory } from '@/features/history/useHistory'

import '@/game/keyframes.css'

export const Route = createFileRoute('/solo')({
  component: SoloPage,
})

const NICKNAME_KEY = 'chuhuahua:nickname'
// 비둘기 등장 경고 마커 표시 시간 (F-1.7, reference 1100).
// 마커 push 후 본 ms 경과 시 마커 제거 + 비둘기 실제 스폰.
const PIGEON_WARN_DURATION = 1300
const FLOAT_DURATION = 800 // ms — FloatText 기준 잔여시간 (FloatText.tsx FLOAT_LIFETIME과 일치)
const TOAST_DURATION = 1800 // ms
const CHARACTER_BOX = 150 // px — 캐릭터 wrapper 정사각 (캐릭터/아이템 1.5배 시각)
// 아이템 expireAt 까지 남은 시간이 본 값 이하면 item-expire 깜빡임 + 글로우 시작.
const ITEM_EXPIRE_WARN_MS = 2000

type GameState = 'playing' | 'paused' | 'confirmQuit' | 'gameover'

function SoloPage() {
  const navigate = useNavigate()
  const history = useHistory()

  // 게임 객체는 ref. React state는 표시 트리거만.
  // gameStartRef는 마운트 useEffect에서 performance.now()로 채움 (initializer 안에서 impure 함수 호출 금지).
  const refs = useRef<GameRefs>(createInitialState())
  const gameStartRef = useRef<number>(0)
  // 가상 컨트롤러는 root layout이 마운트, 입력은 chi-input.ts의 module-level virtualInputRef로 동기.

  const [gameState, setGameState] = useState<GameState>('playing')
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null)
  // 게임오버 → 카드 shake + 빨간 flash가 ~500ms 동안 끝난 뒤 모달 등장.
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [toasts, setToasts] = useState<ToastRef[]>([])
  // 일시정지 관리: paused 진입 시각.
  // 옵션 (a) 동선: confirmQuit 진입 시 paused 정산 → 더 놀래 = playing 직행 (paused 복귀 X).
  const pausedAtRef = useRef<number>(0)

  // 스케줄러 콜백이 stale state를 안 보게 ref 미러.
  const gameStateRef = useRef<GameState>(gameState)
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // 토스트는 매 프레임 setState 회피 — 200ms 폴링으로 만료 정리.
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now()
      setToasts((prev) => prev.filter((t) => t.until > now))
    }, 200)
    return () => window.clearInterval(id)
  }, [])

  const showToast = useCallback((text: string, color: string) => {
    const now = performance.now()
    setToasts((prev) => {
      const next = [
        ...prev,
        { id: now + Math.random(), text, color, until: now + TOAST_DURATION },
      ]
      return next.slice(-MAX_TOASTS)
    })
  }, [])

  const pushFloatText = useCallback(
    (text: string, x: number, y: number, color: string) => {
      const now = performance.now()
      refs.current.floatTexts.push({
        id: now + Math.random(),
        text,
        x,
        y,
        color,
        until: now + FLOAT_DURATION,
      })
    },
    [],
  )

  const triggerGameOver = useCallback((cause: GameOverInfo['cause']) => {
    const sm = refs.current.scoreMirror
    setGameOverInfo({
      finalScore: sm.score,
      maxLevel: sm.level,
      maxCombo: sm.maxCombo,
      elapsedMs: performance.now() - gameStartRef.current,
      cause,
    })
    setGameState('gameover')
  }, [])

  const startGame = useCallback(() => {
    refs.current = createInitialState()
    gameStartRef.current = performance.now()
    setGameOverInfo(null)
    setShowGameOverModal(false)
    setToasts([])
    pausedAtRef.current = 0
    setGameState('playing')
  }, [])

  // gameover 진입 → shake/flash가 ~500ms 동안 보인 뒤 모달 등장.
  // gameover 이탈은 startGame()/onMain만 가능, 둘 다 showGameOverModal을 명시 리셋.
  useEffect(() => {
    if (gameState !== 'gameover') return
    const t = window.setTimeout(() => setShowGameOverModal(true), 500)
    return () => window.clearTimeout(t)
  }, [gameState])

  // 일시정지 토글 — playing ↔ paused. resume 시 pausedDuration만큼 모든 timed 값 보정.
  //
  // React 18 Strict Mode는 dev에서 setState updater를 두 번 호출(불순 updater 검출용).
  // pausedAtRef mutation / adjustTimersByPauseDuration이 두 번 실행되면 resume 시
  // pausedDuration이 `now - 0 = performance.now()` 규모로 폭증 → effect.until / lastKissAt
  // 등이 미래로 튀어 게이지 max 고정 + 뽀뽀 디바운스 영구 차단 버그가 났음.
  // → 각 분기를 idempotent하게 가드 (pausedAtRef 값으로 1회만 적용 보장).
  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === 'playing') {
        if (pausedAtRef.current === 0) {
          pausedAtRef.current = performance.now()
        }
        return 'paused'
      }
      if (prev === 'paused') {
        if (pausedAtRef.current > 0) {
          const pausedDuration = performance.now() - pausedAtRef.current
          adjustTimersByPauseDuration(refs.current, pausedDuration)
          pausedAtRef.current = 0
        }
        return 'playing'
      }
      return prev
    })
  }, [])

  // 그만두기 확인 모달 열기 — 게임 시간은 멈춤. 더 놀래 시엔 항상 playing 직행 (옵션 a).
  // paused에서 진입 시 그 시점까지의 pausedDuration을 timer에 즉시 보정한 뒤,
  // confirmQuit 동안의 추가 freeze는 새 pausedAtRef로 측정 → 더 놀래 시 그 만큼 또 보정.
  // (보정 사이클이 분리되지만 timer까지의 누적 paused time은 동일 — HUD jump 없음.)
  const openQuitConfirm = useCallback(() => {
    setGameState((prev) => {
      if (prev !== 'playing' && prev !== 'paused') return prev
      if (prev === 'paused' && pausedAtRef.current > 0) {
        const pausedDuration = performance.now() - pausedAtRef.current
        adjustTimersByPauseDuration(refs.current, pausedDuration)
      }
      pausedAtRef.current = performance.now()
      return 'confirmQuit'
    })
  }, [])

  // 그만두기 취소 — playing 직행 (paused 복귀 X). confirmQuit 동안 흐른 시간만큼 timer 보정.
  const cancelQuit = useCallback(() => {
    setGameState((prev) => {
      if (prev !== 'confirmQuit') return prev
      if (pausedAtRef.current > 0) {
        const pausedDuration = performance.now() - pausedAtRef.current
        adjustTimersByPauseDuration(refs.current, pausedDuration)
        pausedAtRef.current = 0
      }
      return 'playing'
    })
  }, [])

  // 그만두기 확정 — 현재 점수 그대로 게임오버. pausedDuration 보정 X (게임 종료).
  const confirmQuitGame = useCallback(() => {
    triggerGameOver('quit')
  }, [triggerGameOver])

  // 마운트 1회 — gameStart 타임스탬프만 갱신 (state 변경 X).
  // 초기 gameState='playing' + refs.current=createInitialState로 이미 게임 즉시 진입 상태.
  useEffect(() => {
    gameStartRef.current = performance.now()
  }, [])

  // ── 콜백 (게임 루프 → 점수/효과/시각) ─────────────────────────────────
  const onLevelUp = useCallback(
    (newLevel: number) => {
      if (isMilestoneLevel(newLevel)) {
        showToast(`LV${newLevel} 마일스톤!`, 'var(--color-game-accent-gold)')
      }
      // LV3 도달 시 디버프 아이템 활성화 (cucumber 먼저, sweetPotato는 +stagger 후).
      // reference 985~988.
      if (newLevel === DEBUFF_LEVEL_MIN) {
        scheduleDebuffFirstSpawn('cucumber', DEBUFF_AFTER_LV3_FIRST)
        scheduleDebuffFirstSpawn(
          'sweetPotato',
          DEBUFF_AFTER_LV3_FIRST + DEBUFF_STAGGER,
        )
      }
    },
    [showToast],
  )

  const onKiss = useCallback(
    (prevLastKissAt: number) => {
      const now = performance.now()
      const oldScore = refs.current.scoreMirror.score
      applyScore({
        refs: refs.current,
        event: 'kiss',
        now,
        prevLastKissAt,
      })
      const newScore = refs.current.scoreMirror.score
      const gained = newScore - oldScore
      if (gained > 0) {
        const chi = refs.current.chi
        pushFloatText(`+${gained}`, chi.x, chi.y - 30, 'var(--color-pink-700)')
      }
      rollComboReward({
        refs: refs.current,
        combo: refs.current.scoreMirror.combo,
        now,
        showToast,
      })
      checkLevelUp({
        refs: refs.current,
        oldScore,
        newScore,
        now,
        onLevelUp,
      })
    },
    [onLevelUp, pushFloatText, showToast],
  )

  // 픽업 시 Toast(우상단 stack) + FloatText(츄 위에 짧게 떠오름) 동시 발동.
  // 상쇄(cancelled)면 글로우/부스트 효과 안 들어가니 토스트만 표시.
  const onPickup = useCallback(
    (kind: ItemKind, _by: 'chi', cancelled?: boolean) => {
      if (cancelled) {
        showToast('상쇄!', 'var(--color-game-warn)')
        return
      }
      const chi = refs.current.chi
      let label = ''
      let toastText = ''
      let color = 'var(--color-game-warn)'
      if (kind === 'kibble') {
        label = '부스트!'
        toastText = '부스트!'
      } else if (kind === 'fish') {
        label = '쉴드!'
        toastText = '쉴드!'
        color = 'var(--color-game-shield-blue)'
      } else if (kind === 'cucumber') {
        label = '오이!'
        toastText = '고양이 빨라짐!'
        color = 'var(--color-danger)'
      } else if (kind === 'sweetPotato') {
        label = '무거움!'
        toastText = '느려졌어요!'
        color = 'var(--color-danger)'
      }
      showToast(toastText, color)
      if (label) {
        pushFloatText(label, chi.x, chi.y - 30, color)
      }
    },
    [pushFloatText, showToast],
  )

  const onPigeonBlock = useCallback(() => {
    const now = performance.now()
    const oldScore = refs.current.scoreMirror.score
    applyScore({ refs: refs.current, event: 'pigeon-block', now })
    const newScore = refs.current.scoreMirror.score
    const chi = refs.current.chi
    pushFloatText('+1', chi.x, chi.y - 30, 'var(--color-game-success)')
    checkLevelUp({
      refs: refs.current,
      oldScore,
      newScore,
      now,
      onLevelUp,
    })
  }, [onLevelUp, pushFloatText])

  const onShieldBlock = useCallback(() => {
    const now = performance.now()
    const oldScore = refs.current.scoreMirror.score
    applyScore({ refs: refs.current, event: 'shield-block', now })
    const newScore = refs.current.scoreMirror.score
    const cat = refs.current.cat
    pushFloatText('+1', cat.x, cat.y - 30, 'var(--color-game-shield-blue)')
    checkLevelUp({
      refs: refs.current,
      oldScore,
      newScore,
      now,
      onLevelUp,
    })
  }, [onLevelUp, pushFloatText])

  const onCatHit = useCallback(() => {
    triggerGameOver('pigeon-hit')
  }, [triggerGameOver])

  // ── 입력 ───────────────────────────────────────────────────────────
  const isPlaying = useCallback(() => gameStateRef.current === 'playing', [])
  useChiInput({ refs: refs.current, enabled: isPlaying })

  // ESC 키 — playing↔paused 토글, confirmQuit 시 취소(=더 놀래).
  // gameover에선 무시. input/textarea 포커스 중엔 무시 (다른 모달의 닉네임 입력 등).
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }
      const prev = gameStateRef.current
      if (prev === 'playing' || prev === 'paused') {
        e.preventDefault()
        togglePause()
      } else if (prev === 'confirmQuit') {
        e.preventDefault()
        cancelQuit()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [togglePause, cancelQuit])

  // ── 스폰 + cat-target 스케줄러 (gameState 토글에 묶음) ──────────────
  useEffect(() => {
    if (gameState !== 'playing') return

    startSpawnScheduler({
      refs: refs.current,
      getLevel: () => refs.current.scoreMirror.level,
      getNow: () => performance.now(),
      // 2단계 스폰 — 먼저 경고 마커를 push, PIGEON_WARN_DURATION 후 마커 제거 + 비둘기 실제 스폰.
      // stopSpawnScheduler가 호출되면 trackedTimeout이 일괄 정리되어 마커 제거 콜백도 취소되므로,
      // 스폰 스케줄러는 stop 시 잔여 warnings를 함께 비운다(spawn.ts).
      spawnPigeon: () => {
        const now = performance.now()
        const { wid, spawnX, spawnY } = spawnPigeonWarning(refs.current, now)
        trackedTimeout(() => {
          removeWarning(refs.current, wid)
          commitPigeonAt(refs.current, spawnX, spawnY, performance.now())
        }, PIGEON_WARN_DURATION)
      },
      spawnItem: (kind: SoloSpawnKind) =>
        spawnItem(refs.current, kind, performance.now()),
    })

    scheduleCatTarget({
      refs: refs.current,
      getLevel: () => refs.current.scoreMirror.level,
      enabled: isPlaying,
    })

    return () => {
      stopSpawnScheduler()
      stopCatTargetScheduler()
    }
  }, [gameState, isPlaying])

  // ── 메인 게임 루프 ─────────────────────────────────────────────────
  useGameLoop({
    enabled: gameState === 'playing',
    update: (dt, now) => {
      const r = refs.current
      const level = r.scoreMirror.level

      applyChiPhysics(r, now, dt, () => level)
      updateCatFlee(r, level, now, dt)
      updatePigeons(r, level, dt)

      checkKiss({ refs: r, now, onKiss })
      checkPickups({
        refs: r,
        now,
        scheduleRespawn: scheduleItemRespawn,
        onPickup,
      })
      checkPigeonHits({
        refs: r,
        now,
        onCatHit,
        onPigeonBlock,
        onShieldBlock,
      })

      updateParticles(r.particles)
      updateBgHearts(r.bgHearts)
      expireCombo(r, now)
      expireTransients(r, now)
    },
  })

  // ── 게임오버 모달 핸들러 ────────────────────────────────────────────
  const handleGameOverSubmit = (name: string) => {
    if (!gameOverInfo) return
    history.save({
      name,
      score: gameOverInfo.finalScore,
      maxLevel: gameOverInfo.maxLevel,
      maxCombo: gameOverInfo.maxCombo,
      elapsedMs: gameOverInfo.elapsedMs,
    })
    try {
      localStorage.setItem(NICKNAME_KEY, name)
    } catch {
      // 무시
    }
  }

  const defaultName = (() => {
    try {
      return localStorage.getItem(NICKNAME_KEY) ?? ''
    } catch {
      return ''
    }
  })()

  // ── 렌더 ───────────────────────────────────────────────────────────
  // paused/confirmQuit 중에는 now를 paused 진입 시각으로 고정 → HUD 효과 게이지가
  // 멈춤 시점에 정지(가짜로 줄어들지 않음). resume 시 adjustTimersByPauseDuration이
  // effect.until에 pausedDuration을 더해 보정하므로 그 후엔 정상 흐름.
  const isPausedView = gameState === 'paused' || gameState === 'confirmQuit'
  const now =
    isPausedView && pausedAtRef.current > 0
      ? pausedAtRef.current
      : performance.now()
  const r = refs.current
  const chi = r.chi
  const cat = r.cat
  const effects = r.effects
  const sm = r.scoreMirror

  const chiKissing = r.kissing.active && r.kissing.until > now
  const chiBoosted = effects.chiBoost.until > now
  const chiMega = chiBoosted && Boolean(effects.chiBoost.mega)
  const chiSlowed = effects.chiSlow.until > now
  const catKissing = chiKissing // 같은 플래그 공유 (둘이 같이 뽀뽀 중)
  const catShielded = effects.catShield.until > now
  const catAngry = effects.catSpeedup.until > now // 오이 디버프 (cucumber)

  const chiFacing = chi.facing === 'right' ? -1 : 1
  const catFacing = cat.facing === 'right' ? -1 : 1

  const bgUrl = getBackgroundForLevel(sm.level)

  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: `url(${bgUrl}) center / cover no-repeat`,
          transition: 'background 0.6s ease',
          // 게임오버 진입 시 game-stage 전체 흔들림 (500ms 1회). flash 오버레이는 내부에 별도 렌더.
          animation:
            gameState === 'gameover'
              ? 'game-stage-shake 500ms ease-out'
              : undefined,
        }}
      >
        {/* 배경 부유 하트 (zIndex 1, 캐릭터/아이템/HUD 아래) */}
        <BgHearts hearts={r.bgHearts} />

        {/* 아이템 — 캐릭터/비둘기 아래.
            item-bob: 위아래 부유 + 살짝 회전 (1.4s 무한).
            만료 직전 2초(ITEM_EXPIRE_WARN_MS)부터 item-expire로 교체(결정 옵션 2a)
            + drop-shadow 글로우(결정 옵션 3). */}
        {r.items.map((item) => {
          const isExpiringSoon = item.expireAt - now < ITEM_EXPIRE_WARN_MS
          return (
            <div
              key={item.id}
              className="absolute flex items-center justify-center"
              style={{
                left: item.x,
                top: item.y,
                width: CHARACTER_BOX,
                height: CHARACTER_BOX,
                transform: 'translate(-50%, -50%)',
                animation: isExpiringSoon
                  ? 'item-expire 0.5s ease-in-out infinite'
                  : 'item-bob 1.4s ease-in-out infinite',
                filter: isExpiringSoon
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))'
                  : undefined,
              }}
            >
              {item.kind === 'kibble' && <Kibble />}
              {item.kind === 'fish' && <Fish />}
              {item.kind === 'cucumber' && <Cucumber />}
              {item.kind === 'sweetPotato' && <SweetPotato />}
            </div>
          )
        })}

        {/* 츄와와 — 외부 wrapper(translate + facing scaleX) 안 inner div가 kiss-shake.
            key={kissing.until} → 매 뽀뽀마다 inner remount → 애니메이션 재시작
            (결정 옵션 4: Cat의 kiss-bounce와 동일 패턴). */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: chi.x,
            top: chi.y,
            width: CHARACTER_BOX,
            height: CHARACTER_BOX,
            transform: `translate(-50%, -50%) scaleX(${chiFacing})`,
          }}
        >
          <div
            key={`chi-shake-${r.kissing.until}`}
            style={{
              animation: chiKissing ? 'kiss-shake 400ms ease-out' : undefined,
            }}
          >
            <Chihuahua
              kissing={chiKissing}
              boosted={chiBoosted}
              mega={chiMega}
              slowed={chiSlowed}
            />
          </div>
        </div>

        {/* 고양이 + 쉴드 거품 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: cat.x,
            top: cat.y,
            width: CHARACTER_BOX,
            height: CHARACTER_BOX,
            transform: `translate(-50%, -50%) scaleX(${catFacing})`,
          }}
        >
          {/* inner div — kiss 시 kiss-bounce keyframe(통통 2번 점프).
              key=kissing.until → 매 kiss마다 inner remount → animation 재시작. */}
          <div
            key={`cat-bounce-${r.kissing.until}`}
            style={{
              animation: catKissing ? 'kiss-bounce 500ms ease-out' : undefined,
            }}
          >
            <Cat kissing={catKissing} shielded={catShielded} angry={catAngry} />
          </div>
        </div>
        {catShielded && (
          <div
            className="pointer-events-none absolute"
            style={{ left: cat.x, top: cat.y, width: 0, height: 0 }}
          >
            <ShieldBubble owner="cat" />
          </div>
        )}

        {/* 비둘기 등장 경고 마커 (F-1.7) — z 7. 1.3s 후 자동 사라지고 같은 위치에서 비둘기 등장.
            wrapper(translate)는 위치만 잡고, 내부 칩이 실제 -50% 중앙정렬 + warn-pulse scale. */}
        {r.warnings.map((w) => (
          <div
            key={w.id}
            className="pointer-events-none absolute"
            style={{
              left: w.x,
              top: w.y,
              zIndex: 7,
              animation: 'warn-pulse 0.35s ease-in-out infinite',
            }}
          >
            <div
              style={{
                background: 'var(--color-danger)',
                color: '#ffffff',
                border: '3px solid var(--color-ink-base)',
                borderRadius: 8,
                padding: '4px 10px',
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                lineHeight: 1,
                boxShadow: '3px 3px 0 var(--color-ink-base)',
                whiteSpace: 'nowrap',
                transform: 'translate(-50%, -50%)',
              }}
            >
              ! 비둘기 !
            </div>
          </div>
        ))}

        {/* 비둘기 */}
        {r.pigeons.map((p) => (
          <div
            key={p.id}
            className="absolute flex items-center justify-center"
            style={{
              left: p.x,
              top: p.y,
              width: CHARACTER_BOX,
              height: CHARACTER_BOX,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Pigeon fleeing={p.state === 'fleeing'} vx={p.vx} vy={p.vy} />
          </div>
        ))}

        {/* 하트 파티클 — z 8 (캐릭터 위, mwah/levelUp 아래) */}
        <Particles particles={r.particles} />

        {/* 비둘기 차단 흰 ring 충격파 — z 7 (파티클/FloatText/Mwah 아래) */}
        <Shockwaves items={r.shockwaves} />

        {/* 뽀뽀 "쪽!!" — z 10 */}
        <Mwah state={r.mwah} now={now} />

        {/* HUD (좌상단 점수 + 우상단 LV/효과 게이지/토스트 stack) / 콤보 라벨 / 오버레이 / 플로트 텍스트 */}
        <HUD
          score={sm.score}
          level={sm.level}
          effects={effects}
          now={now}
          toasts={toasts}
        />
        <ComboLabel combo={sm.combo} visible={gameState === 'playing'} />
        {/* 레벨업 효과 — z 18 (HUD/콤보 위) */}
        <LevelUpEffect state={r.levelUpEffect} now={now} />
        <FloatTexts items={r.floatTexts} now={now} />

        {/* 게임오버 빨간 플래시 — 카드 전체 위에 1회 페이드. 모달보다 아래(모달은 portal/z-100). */}
        {gameState === 'gameover' && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'rgba(255, 51, 68, 0.5)',
              animation: 'game-stage-flash 500ms ease-out forwards',
            }}
          />
        )}
      </div>

      {showGameOverModal && gameOverInfo && (
        <GameOverModal
          open={true}
          info={gameOverInfo}
          rank={history.getRank(gameOverInfo.finalScore)}
          defaultName={defaultName}
          onSubmit={handleGameOverSubmit}
          onRestart={startGame}
          onMain={() => navigate({ to: '/' })}
        />
      )}

      {/* 일시정지/그만두기 모달 (gameover와 동일하게 라우트 레벨 portal/overlay) */}
      <PauseModal open={gameState === 'paused'} onResume={togglePause} />
      <QuitConfirmModal
        open={gameState === 'confirmQuit'}
        onCancel={cancelQuit}
        onConfirm={confirmQuitGame}
      />

      {/* DSFrame/GameFrameCard 외부 컨트롤 바 — root layout의 #game-controls-slot에 portal.
          playing/paused 동안만 표시 (confirmQuit/gameover는 모달이 입력 차단). */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <SoloControlBar
          paused={gameState === 'paused'}
          onTogglePause={togglePause}
          onQuit={openQuitConfirm}
        />
      )}
    </>
  )
}
