import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'

import { CHARACTER_ASSETS } from '@/assets'
import { Cat } from '@/game/characters/Cat'
import { Chihuahua } from '@/game/characters/Chihuahua'
import { ShieldBubble } from '@/game/characters/ShieldBubble'
import { Cucumber } from '@/game/items/Cucumber'
import { Fish } from '@/game/items/Fish'
import { Kibble } from '@/game/items/Kibble'
import { SweetPotato } from '@/game/items/SweetPotato'

import { applyChiPhysics, useChiInput } from '@/game/ai/chi-input'
import { applyCatPvpPhysics } from '@/game/ai/cat-input'
import { checkPvpKiss } from '@/game/collision/pvp-kiss'
import { checkPvpPickups } from '@/game/collision/pvp-pickup'
import { getRandomBackground } from '@/game/backgrounds'
import { PVP_KISS_GOAL, PVP_TIME_LIMIT } from '@/game/constants'
import { spawnItem, updateBgHearts } from '@/game/loop/factories'
import {
  schedulePvpItemRespawn,
  startPvpSpawnScheduler,
  stopPvpSpawnScheduler,
} from '@/game/loop/pvp-spawn'
import { adjustTimersByPauseDuration } from '@/game/loop/pause'
import {
  createInitialState,
  expireTransients,
  type GameRefs,
} from '@/game/loop/state'
import { useGameLoop } from '@/game/loop/useGameLoop'
import type { ItemKind, PickerSide } from '@/game/state'

import { BgHearts } from '@/game/ui/BgHearts'
import { FloatTexts } from '@/game/ui/FloatText'
import { Mwah } from '@/game/ui/Mwah'
import { Particles } from '@/game/ui/Particles'
import { PauseModal } from '@/game/ui/PauseModal'
import { PvpControlBar } from '@/game/ui/PvpControlBar'
import { PvpHud } from '@/game/ui/PvpHud'
import { QuitConfirmModal } from '@/game/ui/QuitConfirmModal'
import { updateParticles } from '@/game/particles'

import { usePvpHistory } from '@/features/pvp-history/usePvpHistory'

import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'
import { PixelChip } from '@/ui/PixelChip'

import '@/game/keyframes.css'

export const Route = createFileRoute('/multi/local')({
  component: LocalPvpPage,
})

const CHARACTER_BOX = 150 // px — solo.tsx와 동일
const ITEM_EXPIRE_WARN_MS = 2000
const FLOAT_DURATION = 800 // FloatText 일치

type PvpGameState =
  | 'pvpSetup'
  | 'playing'
  | 'paused'
  | 'confirmQuit'
  | 'gameover'
type PvpWinner = 'chi' | 'cat'
type PvpResult = { winner: PvpWinner; kissCount: number; elapsed: number }

function LocalPvpPage() {
  const navigate = useNavigate()
  const pvpHistory = usePvpHistory()

  // refs / 모드 — 마운트 시 즉시 pvp.startedAt 채움.
  const refs = useRef<GameRefs>(createInitialState())
  const gameModeRef = useRef<'solo' | 'pvp'>('pvp')
  // 게임오버 시 시각 멈춤(HUD 동결) 시점. 0이면 흐름 정상, >0이면 그 시각으로 now 고정.
  // F-2.3에서 pause 시스템 추가 시 같은 분기에 pause 조건 얹음.
  const pausedAtRef = useRef<number>(0)

  // Setup 모달부터 시작 — 양쪽 ready 후 startPvpGame()으로 'playing' 전환.
  const [gameState, setGameState] = useState<PvpGameState>('pvpSetup')
  const [pvpResult, setPvpResult] = useState<PvpResult | null>(null)
  // 배경은 진입 시 1회 픽 — 게임 중 변경 없음.
  const [bgUrl] = useState<string>(() => getRandomBackground())

  // ready state — 각자 자기 키 한 번 눌러 준비.
  // keydown 핸들러는 closure라 state 직접 읽으면 stale → ref 동기화 필수.
  const [chiPlayerReady, setChiPlayerReady] = useState(false)
  const [catPlayerReady, setCatPlayerReady] = useState(false)
  const chiPlayerReadyRef = useRef(false)
  const catPlayerReadyRef = useRef(false)
  useEffect(() => {
    chiPlayerReadyRef.current = chiPlayerReady
  }, [chiPlayerReady])
  useEffect(() => {
    catPlayerReadyRef.current = catPlayerReady
  }, [catPlayerReady])

  // 30fps 렌더 미러용 — pvp time/count는 매 프레임 갱신해도 표시는 useGameLoop의 forceRender에 묶임.
  const gameStateRef = useRef<PvpGameState>(gameState)
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // pvpSetup 30초간 상호작용 없으면 자동으로 메인 복귀.
  // chiPlayerReady/catPlayerReady가 dependency라 ready 토글 시 effect 재실행 → 타이머 리셋.
  // gameStateRef 가드는 setTimeout 발화 시점에 setup 이탈 여부 재확인 (race 방지).
  useEffect(() => {
    if (gameState !== 'pvpSetup') return
    const timer = window.setTimeout(() => {
      if (gameStateRef.current === 'pvpSetup') navigate({ to: '/' })
    }, 30000)
    return () => window.clearTimeout(timer)
  }, [gameState, chiPlayerReady, catPlayerReady, navigate])

  // 게임오버 트리거 — 결과 캡처(winner/kissCount/elapsed) + HUD 동결 + history 저장.
  // 캡처는 startPvpGame이 다시 도전 시 r.pvp를 0으로 리셋하기 전에 해야 정확.
  const triggerPvpGameOver = useCallback(
    (w: PvpWinner) => {
      const r = refs.current
      const now = performance.now()
      // cat 승은 시간 만료라 elapsed = TIME_LIMIT으로 고정 (now - startedAt에 미세 오차 가능).
      const elapsed =
        w === 'cat' ? PVP_TIME_LIMIT : Math.max(0, now - r.pvp.startedAt)
      const kissCount = r.pvp.kissCount
      setPvpResult({ winner: w, kissCount, elapsed })
      pausedAtRef.current = now
      setGameState('gameover')
      pvpHistory.save({ winner: w, kissCount, elapsed })
    },
    [pvpHistory],
  )

  // Setup 취소 — PvP는 별도 라우트라 메인 복귀로 매핑.
  const cancelPvpSetup = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  // PvP 시작 — startedAt/kissCount 재설정 + ready 플래그 리셋 + 'playing' 전환.
  // 마운트 effect의 startedAt은 setup 동안에도 채워두지만, 시작 시점에 덮어써서 타이머가 0부터 흐름.
  const startPvpGame = useCallback(() => {
    const r = refs.current
    r.pvp.startedAt = performance.now()
    r.pvp.kissCount = 0
    setChiPlayerReady(false)
    setCatPlayerReady(false)
    setGameState('playing')
  }, [])

  // 다시 도전 — 잔여물(파티클/아이템/이펙트/비둘기 등) 일괄 리셋 후 Setup 모달로 복귀.
  // createInitialState가 pvp.startedAt/kissCount도 0으로 초기화 → startPvpGame이 시작 시 재설정.
  const retryPvp = useCallback(() => {
    refs.current = createInitialState()
    setPvpResult(null)
    setChiPlayerReady(false)
    setCatPlayerReady(false)
    pausedAtRef.current = 0
    setGameState('pvpSetup')
  }, [])

  // ── 일시정지 / 그만두기 ─────────────────────────────────────────────
  // 공용 adjustTimersByPauseDuration는 effects/transients/items/floatTexts/shockwaves/
  // lastKissAt 등 모든 시간 필드를 보정함. PvP 전용 pvp.startedAt(종료 판정용)만 wrapping 추가.
  // 단위: performance.now() (F-2.2a 게임오버 동결과 동일). 솔로 패턴 그대로.
  const adjustPvpTimers = (pausedDuration: number) => {
    if (pausedDuration <= 0) return
    adjustTimersByPauseDuration(refs.current, pausedDuration)
    if (refs.current.pvp.startedAt > 0) {
      refs.current.pvp.startedAt += pausedDuration
    }
  }

  // playing ↔ paused 토글. React 18 Strict Mode 더블 실행 회피를 위해 각 분기 idempotent 가드
  // (pausedAtRef 값으로 1회만 적용). 솔로 togglePause와 동일 패턴.
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
          adjustPvpTimers(pausedDuration)
          pausedAtRef.current = 0
        }
        return 'playing'
      }
      return prev
    })
  }, [])

  // 그만두기 확인 모달 열기. paused에서 진입 시 paused 정산 후 confirmQuit 동안의 추가 freeze는
  // 새 pausedAtRef로 측정 — 더 놀래 시 그만큼 또 보정. 솔로 openQuitConfirm 동일 패턴.
  const openQuitConfirm = useCallback(() => {
    setGameState((prev) => {
      if (prev !== 'playing' && prev !== 'paused') return prev
      if (prev === 'paused' && pausedAtRef.current > 0) {
        const pausedDuration = performance.now() - pausedAtRef.current
        adjustPvpTimers(pausedDuration)
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
        adjustPvpTimers(pausedDuration)
        pausedAtRef.current = 0
      }
      return 'playing'
    })
  }, [])

  // 그만두기 확정 — PvP는 게임오버 화면 없이 바로 메인 복귀 (라우트 unmount되어 ref 상태 무관).
  const confirmQuitGame = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  // ESC 키 — playing↔paused 토글, confirmQuit 시 취소(=더 놀래). 솔로와 동일 패턴.
  // gameover/pvpSetup에선 무시. input/textarea 포커스 중엔 무시(다른 모달 텍스트 입력 충돌 방지).
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

  // 마운트 1회 — pvp 게임 시작 타임스탬프 + chi/cat ref init.
  useEffect(() => {
    const r = refs.current
    r.pvp.startedAt = performance.now()
    r.pvp.kissCount = 0
  }, [])

  // ── 입력 ───────────────────────────────────────────────────────────
  const isPlaying = useCallback(() => gameStateRef.current === 'playing', [])
  // chi-input은 키 상태만 keysRef에 채움. PvP에선 chi는 WASD, cat은 화살표를 같은 ref에서 읽음.
  // pvpSetup 동안은 enabled=false라 게임 입력으로 흐르지 않음.
  useChiInput({ refs: refs.current, enabled: isPlaying })

  // pvpSetup 전용 ready 키 핸들러 — WASD = chi ready, 화살표 = cat ready, Enter = 둘 다 ready면 시작.
  // input/textarea 포커스 중엔 무시 (다른 모달 텍스트 입력과의 충돌 회피).
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'pvpSetup') return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault()
        setChiPlayerReady(true)
      } else if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)
      ) {
        e.preventDefault()
        setCatPlayerReady(true)
      } else if (k === 'enter') {
        e.preventDefault()
        if (chiPlayerReadyRef.current && catPlayerReadyRef.current) {
          startPvpGame()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [startPvpGame])

  // 픽업 처리 후 짧은 FloatText 표시 (디버깅/검증용 — F-2에서 토스트로 정식 분기).
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

  // 정상 픽업 부여 시 라벨 floatText. cancelled(상쇄/해제/막음)는 effects.ts / pvp-pickup.ts가
  // "야호!"/"해제!"/"막음!" 등을 자체 push하므로 여기선 가드 return으로 중복 방지.
  // sweetPotato 정상 슬로우 부여도 effects.ts가 "펑!"을 push하므로 제외 (중복 방지).
  const onPickup = useCallback(
    (kind: ItemKind, by: PickerSide, cancelled?: boolean) => {
      if (cancelled) return
      const target = by === 'cat' ? refs.current.cat : refs.current.chi
      let text = ''
      let color = 'var(--color-game-warn)'
      if (kind === 'kibble') {
        text = '부스트!'
      } else if (kind === 'fish') {
        text = '쉴드!'
        color = 'var(--color-game-shield-blue)'
      } else if (kind === 'cucumber') {
        text = '오이!'
        color = 'var(--color-danger)'
      }
      // sweetPotato는 effects.ts에서 "펑!"(슬로우)/"힝..."(부스트 상쇄) 처리.
      if (text) pushFloatText(text, target.x, target.y - 30, color)
    },
    [pushFloatText],
  )

  // ── 스폰 스케줄러 (gameState 토글에 묶음) ──────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return

    startPvpSpawnScheduler({
      refs: refs.current,
      getNow: () => performance.now(),
      spawnItem: (kind) => spawnItem(refs.current, kind, performance.now()),
    })

    return () => {
      stopPvpSpawnScheduler()
    }
  }, [gameState])

  // ── 메인 게임 루프 ─────────────────────────────────────────────────
  useGameLoop({
    enabled: gameState === 'playing',
    update: (dt, now) => {
      const r = refs.current

      // 종료 조건 (매 프레임, 입력/물리 처리 전).
      // kissCount 먼저, elapsed 나중 — 동시 도달 시 츄 승.
      const elapsed = now - r.pvp.startedAt
      if (r.pvp.kissCount >= PVP_KISS_GOAL) {
        triggerPvpGameOver('chi')
        return
      }
      if (elapsed >= PVP_TIME_LIMIT) {
        triggerPvpGameOver('cat')
        return
      }

      // 입력 → 물리. chi는 PvP 모드 (화살표 무시), cat은 화살표 직접 조작.
      applyChiPhysics(
        r,
        now,
        dt,
        () => 0,
        () => gameModeRef.current,
      )
      applyCatPvpPhysics(r, now, dt)

      // 충돌 검사 — kiss, pickup. (비둘기는 PvP에서 스폰 안 됨 → 검사 X.)
      checkPvpKiss({ refs: r, now })
      checkPvpPickups({
        refs: r,
        now,
        scheduleRespawn: schedulePvpItemRespawn,
        onPickup,
      })

      updateParticles(r.particles)
      updateBgHearts(r.bgHearts)
      expireTransients(r, now)
    },
  })

  // ── 렌더 ───────────────────────────────────────────────────────────
  // pausedAtRef > 0이면 그 시각으로 now 고정 → HUD 시간/효과 게이지가 종료 시점에서 멈춤.
  // F-2.2a: 게임오버 진입 시 동결. F-2.3에서 pause 추가 시 같은 분기에 조건 얹음.
  const now = pausedAtRef.current > 0 ? pausedAtRef.current : performance.now()
  const r = refs.current
  const chi = r.chi
  const cat = r.cat
  const effects = r.effects

  const chiKissing = r.kissing.active && r.kissing.until > now
  const chiSlowed = effects.chiSlow.until > now
  const chiBoosted = effects.chiBoost.until > now
  const chiMega = chiBoosted && Boolean(effects.chiBoost.mega)
  // sad는 키스 중엔 미발동 (Chihuahua 컴포넌트 우선순위: kissing > sad > slowed > equipped > default).
  // 조건 단순화는 컴포넌트 내부에서 수행되므로 여기선 활성 여부만 계산.
  const chiSad = effects.chiSad.until > now
  // chi 쉴드 — fish 픽업 시 5초간 부여. sweetPotato 디버프 1회 차단 (소진).
  const chiShielded = effects.chiShield.until > now
  const catKissing = chiKissing
  const catShielded = effects.catShield.until > now
  const catAngry = effects.catSpeedup.until > now
  const catSlowed = effects.catSlow.until > now

  const chiFacing = chi.facing === 'right' ? -1 : 1
  const catFacing = cat.facing === 'right' ? -1 : 1

  const remainingMs = Math.max(0, PVP_TIME_LIMIT - (now - r.pvp.startedAt))

  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: `url(${bgUrl}) center / cover no-repeat`,
        }}
      >
        <BgHearts hearts={r.bgHearts} />

        {/* 아이템 */}
        {r.items.map((item) => {
          const isExpiringSoon = item.expireAt - now < ITEM_EXPIRE_WARN_MS
          return (
            <div
              key={item.id}
              className={clsx(
                'absolute flex items-center justify-center',
                isExpiringSoon
                  ? 'animate-item-expire drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'animate-item-bob',
              )}
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
          )
        })}

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
          <div
            key={`chi-shake-${r.kissing.until}`}
            className={clsx(chiKissing && 'animate-kiss-shake')}
          >
            <Chihuahua
              kissing={chiKissing}
              sad={chiSad}
              slowed={chiSlowed}
              boosted={chiBoosted}
              mega={chiMega}
            />
          </div>
        </div>
        {chiShielded && (
          <div
            className="pointer-events-none absolute"
            style={{ left: chi.x, top: chi.y, width: 0, height: 0 }}
          >
            <ShieldBubble owner="chi" />
          </div>
        )}

        {/* 고양이 */}
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
          <div
            key={`cat-bounce-${r.kissing.until}`}
            className={clsx(catKissing && 'animate-kiss-bounce')}
          >
            <Cat
              kissing={catKissing}
              shielded={catShielded}
              angry={catAngry}
              slowed={catSlowed}
            />
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

        {/* 파티클 */}
        <Particles particles={r.particles} />

        {/* 뽀뽀 "쪽!!" */}
        <Mwah state={r.mwah} now={now} />

        {/* PvP HUD — 중앙 상단 시간/카운트, 우상단 catShield 게이지 */}
        <PvpHud
          remainingMs={remainingMs}
          kissCount={r.pvp.kissCount}
          kissGoal={PVP_KISS_GOAL}
          effects={effects}
          now={now}
        />

        {/* 부유 텍스트 */}
        <FloatTexts items={r.floatTexts} now={now} />
      </div>

      {/* Setup 모달 — pvpSetup 동안 표시. backdrop이 게임 영역을 가림. */}
      <PvpSetupModal
        open={gameState === 'pvpSetup'}
        chiReady={chiPlayerReady}
        catReady={catPlayerReady}
        onToggleChi={() => setChiPlayerReady((v) => !v)}
        onToggleCat={() => setCatPlayerReady((v) => !v)}
        onCancel={cancelPvpSetup}
        onStart={startPvpGame}
      />

      {/* 게임오버 모달 — gameover 진입 + 결과 캡처 완료 시 표시. */}
      <PvpGameOverModal
        open={gameState === 'gameover' && pvpResult !== null}
        result={pvpResult}
        onMain={() => navigate({ to: '/' })}
        onRetry={retryPvp}
      />

      {/* 일시정지 / 그만두기 모달 — 솔로와 동일 컴포넌트 재사용 (mode='pvp'로 이미지/멘트 분기). */}
      <PauseModal
        open={gameState === 'paused'}
        onResume={togglePause}
        mode="pvp"
      />
      <QuitConfirmModal
        open={gameState === 'confirmQuit'}
        onCancel={cancelQuit}
        onConfirm={confirmQuitGame}
      />

      {/* 컨트롤 바 — playing/paused 동안만 표시. confirmQuit/gameover/pvpSetup은 모달이 입력 차단.
          root layout의 #pvp-controls-slot에 portal로 마운트 (솔로 SoloControlBar 패턴 미러). */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <PvpControlBar
          paused={gameState === 'paused'}
          onTogglePause={togglePause}
          onQuit={openQuitConfirm}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Setup 모달 — "둘이서 모드" 시작 전 각자 준비.
// 데스크톱: 자기 키 입력(WASD/방향키)으로 준비. 터치 기기: 캐릭터 카드 탭으로 준비(토글).
// 카드 탭/키 입력은 디바이스 무관 둘 다 항상 허용 — isTouch는 안내 문구/표시 분기용일 뿐.
// 좌/우 카드 ready 강조는 카드 외곽 스타일(배경/테두리/그림자)만으로 표현.
// 색상은 전부 토큰 변수 사용 (하드코딩 hex 금지).
// ─────────────────────────────────────────────────────────────────────

// 터치(coarse pointer) 기기 감지 — 안내 문구/키 표시 분기용. CSR이라 window 접근 OK지만 가드.
function detectTouch(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window
  )
}

interface PvpSetupModalProps {
  open: boolean
  chiReady: boolean
  catReady: boolean
  onToggleChi: () => void
  onToggleCat: () => void
  onCancel: () => void
  onStart: () => void
}

function PvpSetupModal({
  open,
  chiReady,
  catReady,
  onToggleChi,
  onToggleCat,
  onCancel,
  onStart,
}: PvpSetupModalProps) {
  const bothReady = chiReady && catReady
  const isTouch = detectTouch()
  return (
    <CenterModal
      open={open}
      onClose={onCancel}
      title="둘이서 모드"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-lg flex flex-col items-center text-center">
        <div className="flex w-full justify-center gap-4 md:gap-5 lg:gap-6">
          <PlayerReadyCard
            ready={chiReady}
            label="츄와와"
            imageSrc={CHARACTER_ASSETS.chihuahua}
            imageAlt="츄와와"
            keysText="W A S D"
            isTouch={isTouch}
            onToggleReady={onToggleChi}
          />
          <PlayerReadyCard
            ready={catReady}
            label="고양이"
            imageSrc={CHARACTER_ASSETS.cat}
            imageAlt="고양이"
            keysText="↑ ↓ ← →"
            isTouch={isTouch}
            onToggleReady={onToggleCat}
          />
        </div>
        <div className="mt-2 flex w-full flex-col gap-3">
          <div className="text-text-muted text-xs">
            {isTouch
              ? '각자 캐릭터를 터치해 준비!'
              : '각자 자기 키를 한 번 눌러 준비!'}
          </div>
          <div className="gap-sm flex w-full justify-center">
            <PixelButton variant="secondary" size="lg" onClick={onCancel}>
              취소
            </PixelButton>
            <PixelButton
              className="w-full"
              size="lg"
              disabled={!bothReady}
              onClick={onStart}
            >
              {bothReady
                ? isTouch
                  ? '시작'
                  : '시작 💥 (Enter)'
                : '둘 다 준비 필요'}
            </PixelButton>
          </div>
        </div>
      </div>
    </CenterModal>
  )
}

interface PlayerReadyCardProps {
  ready: boolean
  label: string
  imageSrc: string
  imageAlt: string
  keysText: string
  // 터치 기기면 키 표시(keysText)를 숨긴다 — 키보드 없는 기기엔 의미 없음.
  isTouch: boolean
  // 카드 탭 토글 — 키 입력과 별개의 추가 준비 경로. 누르면 ON, 다시 누르면 OFF.
  onToggleReady: () => void
}

function PlayerReadyCard({
  ready,
  label,
  imageSrc,
  imageAlt,
  keysText,
  isTouch,
  onToggleReady,
}: PlayerReadyCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={ready}
      onClick={onToggleReady}
      onKeyDown={(e) => {
        // Enter/Space로도 토글. stopPropagation으로 window의 Enter(시작) 핸들러와 충돌 차단.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onToggleReady()
        }
      }}
      className={clsx(
        'gap-sm p-lg flex min-w-0 flex-1 cursor-pointer flex-col items-center rounded-md border-[3px] border-solid text-center select-none',
        'transition-[background,border-color,box-shadow,transform] duration-150',
        'hover:-translate-y-0.5 active:translate-y-0',
        ready
          ? 'shadow-card-active border-pink-700 bg-pink-100'
          : 'border-ink-base bg-bg-card shadow-card-rest',
      )}
    >
      <div className="border-ink-soft bg-bg-card flex h-24 w-24 shrink-0 items-center justify-center rounded-md border-2 border-solid">
        <img
          src={imageSrc}
          alt={imageAlt}
          draggable={false}
          className="h-18 w-18 shrink-0 object-contain"
        />
      </div>
      <div className="text-text-primary text-sm">{label}</div>
      {!isTouch && <PixelChip>{keysText}</PixelChip>}
      <div
        className={clsx(
          'text-xs',
          ready ? 'text-text-accent' : 'text-text-muted',
        )}
      >
        {ready ? '✓ 준비 완료' : '대기 중...'}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 게임오버 모달 — 승자 이미지 + 헤더(animate-gameover-shake) + Stats + 액션 버튼.
// 색상은 전부 토큰 클래스. textShadow는 토큰 없어 inline + var() 유지.
// ─────────────────────────────────────────────────────────────────────
interface PvpGameOverModalProps {
  open: boolean
  result: PvpResult | null
  onMain: () => void
  onRetry: () => void
}

function PvpGameOverModal({
  open,
  result,
  onMain,
  onRetry,
}: PvpGameOverModalProps) {
  if (!result) return null
  const { winner, kissCount, elapsed } = result
  const isChi = winner === 'chi'
  const imageSrc = isChi
    ? CHARACTER_ASSETS.chihuahuaVictory
    : CHARACTER_ASSETS.catVictory
  const imageAlt = isChi ? '츄와와 승리' : '냐냐 승리'
  const headerText = isChi ? '💋뽀뽀 성공!' : '✌️도망 성공!'
  const subText = isChi ? '츄와와의 승리!' : '냐냐의 승리!'
  return (
    <CenterModal
      open={open}
      onClose={onMain}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-lg flex flex-col items-center text-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-32.5 w-auto shrink-0 object-contain"
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className={clsx(
              'animate-gameover-shake font-display text-4xl leading-none',
              isChi ? 'text-text-accent' : 'text-text-primary',
            )}
            style={{ textShadow: '2px 2px 0 var(--color-ink-base)' }}
          >
            {headerText}
          </div>
          <div className="text-text-muted text-[13px] leading-none">
            {subText}
          </div>
        </div>

        <div className="flex w-full items-center justify-around border-y-2 border-dashed border-pink-300 py-6">
          <div className="flex flex-col items-center gap-3">
            <div className="text-text-muted text-[11px] leading-none">
              걸린 시간
            </div>
            <div className="text-text-accent text-[26px] leading-none">
              {(elapsed / 1000).toFixed(1)}초
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="text-text-muted text-[11px] leading-none">
              뽀뽀 횟수
            </div>
            <div className="text-text-primary text-[26px] leading-none">
              💋 {kissCount}
            </div>
          </div>
        </div>

        <div className="gap-sm flex w-full justify-center">
          <PixelButton variant="secondary" size="lg" onClick={onMain}>
            메인으로
          </PixelButton>
          <PixelButton className="w-full" size="lg" onClick={onRetry}>
            다시 도전 💪
          </PixelButton>
        </div>
      </div>
    </CenterModal>
  )
}
