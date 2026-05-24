import { useCallback, useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

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

import '@/game/keyframes.css'

export const Route = createFileRoute('/multi/local')({
  component: LocalPvpPage,
})

const CHARACTER_BOX = 150 // px — solo.tsx와 동일
const ITEM_EXPIRE_WARN_MS = 2000
const FLOAT_DURATION = 800 // FloatText 일치
const GAME_OVER_TO_MAIN_MS = 3000 // F-1 임시 — F-2에서 모달로 대체

type PvpGameState = 'playing' | 'gameover'
type PvpWinner = 'chi' | 'cat'

function LocalPvpPage() {
  const navigate = useNavigate()

  // refs / 모드 — 마운트 시 즉시 pvp.startedAt 채움.
  const refs = useRef<GameRefs>(createInitialState())
  const gameModeRef = useRef<'solo' | 'pvp'>('pvp')

  const [gameState, setGameState] = useState<PvpGameState>('playing')
  const [winner, setWinner] = useState<PvpWinner | null>(null)
  // 배경은 진입 시 1회 픽 — 게임 중 변경 없음.
  const [bgUrl] = useState<string>(() => getRandomBackground())

  // 30fps 렌더 미러용 — pvp time/count는 매 프레임 갱신해도 표시는 useGameLoop의 forceRender에 묶임.
  const gameStateRef = useRef<PvpGameState>(gameState)
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const triggerPvpGameOver = useCallback((w: PvpWinner) => {
    setWinner(w)
    setGameState('gameover')
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
  useChiInput({ refs: refs.current, enabled: isPlaying })

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
            style={{
              animation: chiKissing ? 'kiss-shake 400ms ease-out' : undefined,
            }}
          >
            <Chihuahua kissing={chiKissing} slowed={chiSlowed} />
          </div>
        </div>

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
            style={{
              animation: catKissing ? 'kiss-bounce 500ms ease-out' : undefined,
            }}
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
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(45, 27, 61, 0.55)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-text-on-pink)',
                background: 'var(--color-ink-base)',
                padding: 'var(--gap-lg) var(--gap-xl)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {winner === 'chi' ? '츄와와 승!' : '고양이 승!'}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
