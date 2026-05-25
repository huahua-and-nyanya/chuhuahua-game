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
import { PvpHud } from '@/game/ui/PvpHud'
import { updateParticles } from '@/game/particles'

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
const GAME_OVER_TO_MAIN_MS = 3000 // F-1 임시 — F-2에서 모달로 대체

type PvpGameState = 'pvpSetup' | 'playing' | 'gameover'
type PvpWinner = 'chi' | 'cat'

function LocalPvpPage() {
  const navigate = useNavigate()

  // refs / 모드 — 마운트 시 즉시 pvp.startedAt 채움.
  const refs = useRef<GameRefs>(createInitialState())
  const gameModeRef = useRef<'solo' | 'pvp'>('pvp')

  // Setup 모달부터 시작 — 양쪽 ready 후 startPvpGame()으로 'playing' 전환.
  const [gameState, setGameState] = useState<PvpGameState>('pvpSetup')
  const [winner, setWinner] = useState<PvpWinner | null>(null)
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

  const triggerPvpGameOver = useCallback((w: PvpWinner) => {
    setWinner(w)
    setGameState('gameover')
  }, [])

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

  // 마운트 1회 — pvp 게임 시작 타임스탬프 + chi/cat ref init.
  useEffect(() => {
    const r = refs.current
    r.pvp.startedAt = performance.now()
    r.pvp.kissCount = 0
  }, [])

  // 게임오버 후 3초 뒤 메인 라우트로 이동 (F-1 임시 — F-2에서 모달로 교체).
  useEffect(() => {
    if (gameState !== 'gameover') return
    const t = window.setTimeout(() => {
      navigate({ to: '/' })
    }, GAME_OVER_TO_MAIN_MS)
    return () => window.clearTimeout(t)
  }, [gameState, navigate])

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

  const onPickup = useCallback(
    (kind: ItemKind, by: PickerSide, cancelled?: boolean) => {
      if (cancelled) return
      const target = by === 'cat' ? refs.current.cat : refs.current.chi
      let text = ''
      let color = 'var(--color-game-warn)'
      if (kind === 'kibble') {
        text = '부스트!'
      } else if (kind === 'fish') {
        text = by === 'cat' ? '쉴드!' : '쉴드(준비)'
        color = 'var(--color-game-shield-blue)'
      } else if (kind === 'cucumber') {
        text = '오이!'
        color = 'var(--color-danger)'
      } else if (kind === 'sweetPotato') {
        text = '고구마!'
        color = 'var(--color-danger)'
      }
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
  const now = performance.now()
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

        {/* F-1 임시 — 게임오버 시 화면 중앙 텍스트로 승자 표시 (F-2에서 모달 교체). */}
        {gameState === 'gameover' && winner !== null && (
          <div className="bg-bg-modal-backdrop pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="font-display text-text-on-pink bg-ink-base px-xl py-lg shadow-card rounded-md text-2xl">
              {winner === 'chi' ? '츄와와 승!' : '고양이 승!'}
            </div>
          </div>
        )}
      </div>

      {/* Setup 모달 — pvpSetup 동안 표시. backdrop이 게임 영역을 가림. */}
      <PvpSetupModal
        open={gameState === 'pvpSetup'}
        chiReady={chiPlayerReady}
        catReady={catPlayerReady}
        onCancel={cancelPvpSetup}
        onStart={startPvpGame}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Setup 모달 — "둘이서 모드" 시작 전 각자 자기 키를 한 번 눌러 준비.
// 좌/우 카드 ready 강조는 카드 외곽 스타일(배경/테두리/그림자)만으로 표현.
// 색상은 전부 토큰 변수 사용 (하드코딩 hex 금지).
// ─────────────────────────────────────────────────────────────────────
interface PvpSetupModalProps {
  open: boolean
  chiReady: boolean
  catReady: boolean
  onCancel: () => void
  onStart: () => void
}

function PvpSetupModal({
  open,
  chiReady,
  catReady,
  onCancel,
  onStart,
}: PvpSetupModalProps) {
  const bothReady = chiReady && catReady
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
          />
          <PlayerReadyCard
            ready={catReady}
            label="고양이"
            imageSrc={CHARACTER_ASSETS.cat}
            imageAlt="고양이"
            keysText="↑ ↓ ← →"
          />
        </div>
        <div className="flex w-full flex-col gap-1 md:gap-2 lg:gap-3">
          <div className="text-text-muted text-xs">
            각자 자기 키를 한 번 눌러 준비!
          </div>
          <div className="gap-sm flex justify-center">
            <PixelButton variant="secondary" size="lg" onClick={onCancel}>
              취소
            </PixelButton>
            <PixelButton size="lg" disabled={!bothReady} onClick={onStart}>
              {bothReady ? '시작 💥 (Enter)' : '둘 다 준비 필요'}
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
}

function PlayerReadyCard({
  ready,
  label,
  imageSrc,
  imageAlt,
  keysText,
}: PlayerReadyCardProps) {
  return (
    <div
      className={clsx(
        'gap-sm p-lg flex min-w-0 flex-1 flex-col items-center rounded-md border-[3px] border-solid text-center',
        'transition-[background,border-color,box-shadow] duration-150',
        ready
          ? 'shadow-card-active border-pink-700 bg-pink-100'
          : 'border-ink-base bg-bg-card shadow-card-rest',
      )}
    >
      <div className="border-ink-soft bg-bg-card flex h-24 w-24 shrink-0 items-center justify-center rounded-md border-2 border-solid">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-18 w-18 shrink-0 object-contain"
        />
      </div>
      <div className="text-text-primary text-sm">{label}</div>
      <PixelChip>{keysText}</PixelChip>
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
