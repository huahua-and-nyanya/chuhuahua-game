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
import { GAME_HEIGHT, GAME_WIDTH, MAX_TOASTS } from '@/game/constants'
import { spawnPigeon, spawnItem } from '@/game/loop/factories'
import {
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

import { FloatTexts } from '@/game/ui/FloatText'
import { GameOverModal, type GameOverInfo } from '@/game/ui/GameOverModal'
import { HUD } from '@/game/ui/HUD'
import { LevelUpOverlay } from '@/game/ui/LevelUpOverlay'
import { Toasts } from '@/game/ui/Toast'

import { useHistory } from '@/features/history/useHistory'
import { PixelButton } from '@/ui/PixelButton'

import '@/game/keyframes.css'

export const Route = createFileRoute('/solo')({
  component: SoloPage,
})

const NICKNAME_KEY = 'chuhuahua:nickname'
const FLOAT_DURATION = 800 // ms — FloatText 기준 잔여시간 (FloatText.tsx FLOAT_LIFETIME과 일치)
const TOAST_DURATION = 1800 // ms
const CHARACTER_BOX = 100 // px — 캐릭터 wrapper 정사각

type GameState = 'playing' | 'gameover'

function SoloPage() {
  const navigate = useNavigate()
  const history = useHistory()

  // 게임 객체는 ref. React state는 표시 트리거만.
  // gameStartRef는 마운트 useEffect에서 performance.now()로 채움 (initializer 안에서 impure 함수 호출 금지).
  const refs = useRef<GameRefs>(createInitialState())
  const gameStartRef = useRef<number>(0)

  const [gameState, setGameState] = useState<GameState>('playing')
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null)
  const [toasts, setToasts] = useState<ToastRef[]>([])

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
    setToasts([])
    setGameState('playing')
  }, [])

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
    [onLevelUp, showToast],
  )

  const onPickup = useCallback(
    (kind: ItemKind) => {
      if (kind === 'kibble') {
        showToast('부스트!', 'var(--color-game-warn)')
      } else if (kind === 'fish') {
        showToast('쉴드!', 'var(--color-game-shield-blue)')
      }
    },
    [showToast],
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

  // ── 스폰 + cat-target 스케줄러 (gameState 토글에 묶음) ──────────────
  useEffect(() => {
    if (gameState !== 'playing') return

    startSpawnScheduler({
      refs: refs.current,
      getLevel: () => refs.current.scoreMirror.level,
      getNow: () => performance.now(),
      spawnPigeon: () => spawnPigeon(refs.current, performance.now()),
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
  const now = performance.now()
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

  const chiFacing = chi.facing === 'right' ? -1 : 1
  const catFacing = cat.facing === 'right' ? -1 : 1

  const bgUrl = getBackgroundForLevel(Math.max(1, sm.level))

  return (
    <main className="gap-md p-lg flex min-h-dvh flex-col items-center">
      <div className="flex w-full max-w-160 justify-between">
        <PixelButton
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/' })}
        >
          {'< 메인으로'}
        </PixelButton>
      </div>

      <div
        className="border-ink-base relative overflow-hidden rounded-lg border-4"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: `url(${bgUrl}) center / cover no-repeat`,
          transition: 'background 0.6s ease',
        }}
      >
        {/* 아이템 — 캐릭터/비둘기 아래 */}
        {r.items.map((item) => (
          <div
            key={item.id}
            className="absolute flex items-center justify-center"
            style={{
              left: item.x,
              top: item.y,
              width: CHARACTER_BOX,
              height: CHARACTER_BOX,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {item.kind === 'kibble' && <Kibble />}
            {item.kind === 'fish' && <Fish />}
            {item.kind === 'cucumber' && <Cucumber />}
            {item.kind === 'sweetPotato' && <SweetPotato />}
          </div>
        ))}

        {/* 츄와와 */}
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
          <Chihuahua
            kissing={chiKissing}
            boosted={chiBoosted}
            mega={chiMega}
            slowed={chiSlowed}
          />
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
          <Cat kissing={catKissing} shielded={catShielded} />
        </div>
        {catShielded && (
          <div
            className="pointer-events-none absolute"
            style={{ left: cat.x, top: cat.y, width: 0, height: 0 }}
          >
            <ShieldBubble owner="cat" />
          </div>
        )}

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
            <Pigeon fleeing={p.state === 'fleeing'} />
          </div>
        ))}

        {/* mwah "쪽!" */}
        {r.mwah.active && r.mwah.until > now && (
          <div
            className="font-display pointer-events-none absolute text-lg leading-none"
            style={{
              left: r.mwah.x,
              top: r.mwah.y,
              transform: 'translate(-50%, -50%)',
              color: 'var(--color-pink-700)',
              textShadow: '0 0 4px var(--color-text-on-pink)',
            }}
          >
            쪽!
          </div>
        )}

        {/* HUD / 오버레이 / 토스트 / 플로트 텍스트 */}
        <HUD
          score={sm.score}
          combo={sm.combo}
          maxCombo={sm.maxCombo}
          level={sm.level}
          effects={effects}
          now={now}
        />
        <LevelUpOverlay
          active={r.levelUpEffect.active && r.levelUpEffect.until > now}
          level={r.levelUpEffect.level}
        />
        <Toasts toasts={toasts} />
        <FloatTexts items={r.floatTexts} now={now} />
      </div>

      {gameState === 'gameover' && gameOverInfo && (
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
    </main>
  )
}
