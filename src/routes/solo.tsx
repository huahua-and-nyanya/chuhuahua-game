import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createFileRoute,
  useBlocker,
  useNavigate,
} from '@tanstack/react-router'
import clsx from 'clsx'

import { Cat } from '@/game/characters/Cat'
import { Chihuahua } from '@/game/characters/Chihuahua'
import { Pigeon } from '@/game/characters/Pigeon'
import { ShieldBubble } from '@/game/characters/ShieldBubble'
import { Cucumber } from '@/game/items/Cucumber'
import { Fish } from '@/game/items/Fish'
import { Kibble } from '@/game/items/Kibble'
import { SweetPotato } from '@/game/items/SweetPotato'
import { WeddingBouquet } from '@/game/items/WeddingBouquet'
import { WeddingInvitation } from '@/game/items/WeddingInvitation'
import { WeddingRing } from '@/game/items/WeddingRing'

import {
  applyChiPhysics,
  isAnyVirtualDirDown,
  useChiInput,
} from '@/game/ai/chi-input'
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
  MAX_LEVEL,
  MAX_TOASTS,
  WEDDING_MAX_LEVEL,
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

import { audioManager } from '@/features/audio/audioManager'
import { useHistory } from '@/features/history/useHistory'
import { useWardrobe } from '@/features/wardrobe'
import type { ClothEffects } from '@/features/wardrobe/types'

import { CHARACTER_ASSETS } from '@/assets'
import { BG_PROPOSE, TITLE_LOGO, WEDDING_BGS } from '@/assets/backgrounds'
import {
  createStoryRuntime,
  setupStory,
  updateStory,
} from '@/game/story/proposeStory'
import {
  advanceWeddingSubtitle,
  createWeddingStoryRuntime,
  setupWeddingStory,
  skipWeddingCredits,
  SUBTITLE_LINES,
  updateWeddingStory,
} from '@/game/story/weddingStory'

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

// wedding 자막 진행 키 — 스페이스/엔터 + 방향키/WASD. e.key 소문자 비교.
// 모바일 가상패드는 별도(story 루프 폴링). subtitle phase에선 chi 이동 입력이 비활성이라 충돌 없음.
const SUBTITLE_ADVANCE_KEYS = new Set([
  ' ',
  'enter',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'w',
  'a',
  's',
  'd',
])

type GameState = 'playing' | 'paused' | 'confirmQuit' | 'gameover' | 'story'

function SoloPage() {
  const navigate = useNavigate()
  const history = useHistory()
  const {
    equipped,
    getEquippedEffects,
    getEquippedSkin,
    getEquippedCatSkin,
    getProposeArmed,
    getWeddingArmed,
    markProposeEndingCleared,
    markWeddingUsed,
    earnCoins,
  } = useWardrobe()
  // 장착 옷 효과/스킨은 게임 시작 시 1회 스냅샷 (솔로 중 옷 변경 불가) — 매 프레임 ref만 읽음.
  const equippedEffectsRef = useRef<ClothEffects>(getEquippedEffects())
  // 장착 스킨(츄 풀바디 경로). 미장착이면 undefined → 기본 츄. idle 스프라이트에만 적용.
  const equippedSkinRef = useRef<string | undefined>(getEquippedSkin())
  // 페어 옷이면 냐냐도 같이 입는 스킨. 단독 옷이면 undefined → 기본 냐냐.
  const equippedCatSkinRef = useRef<string | undefined>(getEquippedCatSkin())
  // propose 코스튬 스토리 armed — true면 LV1~9 츄/냐 데이트룩. 솔로(=isSolo)이므로 조건 충족 시 켜짐.
  // 게임 중 옷장 진입 불가 → 시작 시 1회 스냅샷이면 충분 (effects/skin과 동일 패턴).
  const armedRef = useRef<boolean>(getProposeArmed())
  // wedding 게임변형 armed — true면 진행 중 코인 적립 차단. 시작 시 1회 스냅샷(effects와 동일 패턴).
  const weddingArmedRef = useRef<boolean>(getWeddingArmed())
  // wedding 착용 여부(used 무관) — 입으면 전 상태 웨딩 스프라이트. equipped 스냅샷, 시작 시 1회.
  const weddingSkinRef = useRef<boolean>(equipped === 'wedding')

  // 게임 객체는 ref. React state는 표시 트리거만.
  // gameStartRef는 마운트 useEffect에서 performance.now()로 채움 (initializer 안에서 impure 함수 호출 금지).
  const refs = useRef<GameRefs>(createInitialState())
  const gameStartRef = useRef<number>(0)
  // propose 컷신 상태머신 런타임 (gameState==='story' 동안만 의미 있음).
  const storyRef = useRef(createStoryRuntime())
  // wedding 엔딩 컷신 상태머신 런타임 (gameState==='story' + storyKind==='wedding' 동안만).
  const weddingStoryRef = useRef(createWeddingStoryRuntime())
  // 현재 'story' gameState가 어느 컷신인지 — propose/wedding 분기용. 비-story 시 null.
  const storyKindRef = useRef<'propose' | 'wedding' | null>(null)
  // 컷신 진입(LV10) 시점 점수 스냅샷 — 컷신 중 점수 불변이라 모달 결과로 그대로 사용.
  const storySnapshotRef = useRef<{
    finalScore: number
    maxLevel: number
    maxCombo: number
    elapsedMs: number
  } | null>(null)
  // STORY_MODAL 1회성 처리(코인 적립/해금 세팅) 가드 — 모달 표시 시 한 번만.
  const storyModalDoneRef = useRef(false)
  // wedding 자막 진행 키 잠금 — keydown 1회당 1줄. keyup 전엔 재진행 차단(반복/홀드 방지).
  const subtitleKeyLockRef = useRef(false)
  // 가상패드 자막 진행 에지 감지 — 이전 프레임 방향 누름 상태. 0→1 전이에서만 1줄(키 잠금과 분리).
  const subtitleVirtualPrevRef = useRef(false)
  // 가상 컨트롤러는 root layout이 마운트, 입력은 chi-input.ts의 module-level virtualInputRef로 동기.

  const [gameState, setGameState] = useState<GameState>('playing')
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null)
  // 게임오버 → 카드 shake + 빨간 flash가 ~500ms 동안 끝난 뒤 모달 등장.
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  // 컷신 마지막 단계(modal) 진입 시 성공 결과 모달 표시.
  const [showStoryModal, setShowStoryModal] = useState(false)
  // STORY_MODAL에 넘길 결과(점수/레벨/코인 등) — GameOverInfo 재활용(variant='story').
  const [storyResult, setStoryResult] = useState<GameOverInfo | null>(null)
  const [toasts, setToasts] = useState<ToastRef[]>([])
  // 일시정지 관리: paused 진입 시각.
  // 옵션 (a) 동선: confirmQuit 진입 시 paused 정산 → 더 놀래 = playing 직행 (paused 복귀 X).
  const pausedAtRef = useRef<number>(0)

  // 스케줄러 콜백이 stale state를 안 보게 ref 미러.
  const gameStateRef = useRef<GameState>(gameState)
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // 게임 진행 중(playing/paused) 이탈 차단 — 헤더 "메인으로"/브라우저 뒤로가기/경로 이동 모두
  // 가로채 confirm. blocked 시 leaveBlocker.status로 이탈 confirm 모달 노출.
  // 게임 내 "그만두기"(triggerGameOver → gameover)와는 별개 경로. confirmQuit은 자체 모달이
  // 떠 있어 제외(이중 모달 방지), gameover는 결과 모달의 메인 이동을 막지 않도록 제외.
  // enableBeforeUnload로 새로고침/탭 닫기도 네이티브 경고. shouldBlockFn은 ref로 최신 state 참조.
  const isInProgress = () =>
    gameStateRef.current === 'playing' || gameStateRef.current === 'paused'
  const leaveBlocker = useBlocker({
    shouldBlockFn: isInProgress,
    enableBeforeUnload: isInProgress,
    withResolver: true,
  })

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

  const triggerGameOver = useCallback(
    (cause: GameOverInfo['cause']) => {
      const sm = refs.current.scoreMirror
      // 점수만큼 코인 적립(999 상한) → 적립량 + 지갑가득 여부를 게임오버 모달에 전달.
      // wedding 게임변형 진행 중엔 코인 적립 차단(시청 완료 전). quit 경로 포함.
      const { earned, walletFull } = weddingArmedRef.current
        ? { earned: 0, walletFull: false }
        : earnCoins(sm.score)
      setGameOverInfo({
        finalScore: sm.score,
        maxLevel: sm.level,
        maxCombo: sm.maxCombo,
        elapsedMs: performance.now() - gameStartRef.current,
        cause,
        earnedCoins: earned,
        walletFull,
      })
      setGameState('gameover')
    },
    [earnCoins],
  )

  const startGame = useCallback(() => {
    refs.current = createInitialState()
    equippedEffectsRef.current = getEquippedEffects()
    equippedSkinRef.current = getEquippedSkin()
    equippedCatSkinRef.current = getEquippedCatSkin()
    armedRef.current = getProposeArmed()
    weddingArmedRef.current = getWeddingArmed()
    weddingSkinRef.current = equipped === 'wedding'
    gameStartRef.current = performance.now()
    setGameOverInfo(null)
    setShowGameOverModal(false)
    setShowStoryModal(false)
    setStoryResult(null)
    storyModalDoneRef.current = false
    storySnapshotRef.current = null
    storyKindRef.current = null
    setToasts([])
    pausedAtRef.current = 0
    setGameState('playing')
  }, [
    equipped,
    getEquippedEffects,
    getEquippedSkin,
    getEquippedCatSkin,
    getProposeArmed,
    getWeddingArmed,
  ])

  // 컷신 마지막(modal) 진입 시 1회 — 해금 세팅 + 코인 적립 + 결과 모달 구성.
  // 멱등 가드(storyModalDoneRef): 모달 뜨는 순간 즉시 proposeEndingCleared=true →
  // 유저가 모달 안 닫고 메인 가도 해금 유지. 코인도 여기서 1회만 적립.
  const handleStoryModal = useCallback(() => {
    if (storyModalDoneRef.current) return
    const snap = storySnapshotRef.current
    if (!snap) return
    storyModalDoneRef.current = true
    markProposeEndingCleared()
    const { earned, walletFull } = earnCoins(snap.finalScore)
    setStoryResult({
      finalScore: snap.finalScore,
      maxLevel: snap.maxLevel,
      maxCombo: snap.maxCombo,
      elapsedMs: snap.elapsedMs,
      cause: 'quit', // story variant에선 미표시 (필수 필드라 채움)
      earnedCoins: earned,
      walletFull,
    })
    setShowStoryModal(true)
  }, [earnCoins, markProposeEndingCleared])

  // wedding 엔딩 컷신 cg 종료 시 1회 — handleStoryModal 미러.
  // markWeddingUsed(멱등)로 wedding 효과 소멸 확정. wedding 엔딩은 코인 적립 없음(used 보상이 wedding 자체)
  // → earnedCoins 0, walletFull false. 결과 모달은 Happy Ending 문구로 표시(아래 렌더 분기).
  const handleWeddingStoryModal = useCallback(() => {
    if (storyModalDoneRef.current) return
    const snap = storySnapshotRef.current
    if (!snap) return
    storyModalDoneRef.current = true
    markWeddingUsed()
    setStoryResult({
      finalScore: snap.finalScore,
      maxLevel: snap.maxLevel,
      maxCombo: snap.maxCombo,
      elapsedMs: snap.elapsedMs,
      cause: 'quit', // story variant에선 미표시 (필수 필드라 채움)
      earnedCoins: 0,
      walletFull: false,
    })
    setShowStoryModal(true)
  }, [markWeddingUsed])

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
      // armed(propose 3벌 + 미클리어) + LV10 최초 도달 → 컷신 진입.
      // setupStory로 오브젝트/효과 리셋 + 캐릭터 텔레포트를 동기 수행한 뒤 story로 전환.
      // 이미 story면 무시 (재트리거 차단). 컷신 중엔 마일스톤 토스트 등 일반 처리 스킵.
      if (
        armedRef.current &&
        newLevel === MAX_LEVEL &&
        gameStateRef.current !== 'story'
      ) {
        // 진입 시점 점수 스냅샷 — 컷신 중 점수 불변이라 모달 결과로 그대로 쓴다.
        // level.ts checkLevelUp이 scoreMirror.level을 newLevel로 먼저 갱신 후 호출 → sm.level=10.
        const sm = refs.current.scoreMirror
        storySnapshotRef.current = {
          finalScore: sm.score,
          maxLevel: sm.level,
          maxCombo: sm.maxCombo,
          elapsedMs: performance.now() - gameStartRef.current,
        }
        storyKindRef.current = 'propose'
        setupStory(refs.current, performance.now(), storyRef.current)
        setShowStoryModal(false)
        setGameState('story')
        return
      }
      // wedding armed(wedding 착용 + 미사용) + LV5(WEDDING_MAX_LEVEL) 최초 도달 → 엔딩 컷신.
      // propose 분기 미러 — setupWeddingStory로 리셋/배치 후 story 전환. storyKind로 루프 분기.
      if (
        weddingArmedRef.current &&
        newLevel === WEDDING_MAX_LEVEL &&
        gameStateRef.current !== 'story'
      ) {
        const sm = refs.current.scoreMirror
        storySnapshotRef.current = {
          finalScore: sm.score,
          maxLevel: sm.level,
          maxCombo: sm.maxCombo,
          elapsedMs: performance.now() - gameStartRef.current,
        }
        storyKindRef.current = 'wedding'
        setupWeddingStory(
          refs.current,
          performance.now(),
          weddingStoryRef.current,
        )
        setShowStoryModal(false)
        setGameState('story')
        return
      }
      // wedding 게임변형 모드 — 마일스톤 토스트/기본 디버프 모두 스킵(엔딩 흐름과 어긋남).
      const weddingMode =
        equippedEffectsRef.current.itemPoolOverride === 'wedding'
      if (isMilestoneLevel(newLevel) && !weddingMode) {
        showToast(`LV${newLevel} 마일스톤!`, 'var(--color-game-accent-gold)')
      }
      // LV3 도달 시 디버프 아이템 활성화 (cucumber 먼저, sweetPotato는 +stagger 후).
      // reference 985~988.
      if (newLevel === DEBUFF_LEVEL_MIN && !weddingMode) {
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
        weddingMode: equippedEffectsRef.current.itemPoolOverride === 'wedding',
      })
      checkLevelUp({
        refs: refs.current,
        oldScore,
        newScore,
        now,
        onLevelUp,
        weddingMode: equippedEffectsRef.current.itemPoolOverride === 'wedding',
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
        // floatText("펑!"/"힝...")는 effects.ts가 자체 push — label 미설정으로 중복 방지. toast는 유지.
        toastText = '느려졌어요!'
        color = 'var(--color-danger)'
      } else if (kind === 'weddingRing') {
        label = '점수 2배!'
        toastText = '점수 2배!'
        color = 'var(--color-game-accent-gold)'
      } else if (kind === 'weddingInvitation') {
        label = '부스트!'
        toastText = '부스트!'
      } else if (kind === 'weddingBouquet') {
        label = '껌딱지!'
        toastText = '껌딱지!'
        color = 'var(--color-pink-700)'
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
      weddingMode: equippedEffectsRef.current.itemPoolOverride === 'wedding',
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
      weddingMode: equippedEffectsRef.current.itemPoolOverride === 'wedding',
    })
  }, [onLevelUp, pushFloatText])

  const onCatHit = useCallback(() => {
    triggerGameOver('pigeon-hit')
  }, [triggerGameOver])

  // ── 입력 ───────────────────────────────────────────────────────────
  const isPlaying = useCallback(() => gameStateRef.current === 'playing', [])
  // 츄 입력 허용 — 일반 플레이(playing) + propose walk + wedding walk 단계만.
  // 그 외 컷신 단계(intro/kiss/fade/cg/subtitle/modal/jump)는 차단(특히 subtitle은 진행키 전용).
  // ref-shaped 콜백(빈 deps)으로 동일 참조 유지 — useChiInput은 mount 시 1회만 구독.
  const isChiInputEnabled = useCallback(
    () =>
      gameStateRef.current === 'playing' ||
      (gameStateRef.current === 'story' &&
        storyKindRef.current === 'propose' &&
        storyRef.current.phase === 'walk') ||
      (gameStateRef.current === 'story' &&
        storyKindRef.current === 'wedding' &&
        weddingStoryRef.current.phase === 'walk'),
    [],
  )
  useChiInput({ refs: refs.current, enabled: isChiInputEnabled })

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

  // wedding 컷신 유저 진행 — 클릭/키/가상패드 1회. subtitle이면 다음 줄(마지막 줄 후 크레딧),
  // credits면 스크롤 스킵 → 모달. ref만 변경 → story 루프(30fps forceRender)가 다음 프레임 반영.
  const advanceSubtitle = useCallback(() => {
    if (
      gameStateRef.current !== 'story' ||
      storyKindRef.current !== 'wedding'
    ) {
      return
    }
    const phase = weddingStoryRef.current.phase
    const cb = { onModal: handleWeddingStoryModal }
    if (phase === 'subtitle') {
      advanceWeddingSubtitle(weddingStoryRef.current, performance.now(), cb)
    } else if (phase === 'credits') {
      skipWeddingCredits(weddingStoryRef.current, performance.now(), cb)
    }
  }, [handleWeddingStoryModal])

  // 자막 진행 키 — 스페이스/엔터 + 방향키/WASD. keydown 1회당 1줄(keyup 전 재진행 차단으로 홀드/반복 방지).
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (!SUBTITLE_ADVANCE_KEYS.has(e.key.toLowerCase())) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return
      }
      const phase = weddingStoryRef.current.phase
      if (
        gameStateRef.current !== 'story' ||
        storyKindRef.current !== 'wedding' ||
        (phase !== 'subtitle' && phase !== 'credits')
      ) {
        return
      }
      e.preventDefault()
      if (subtitleKeyLockRef.current) return
      subtitleKeyLockRef.current = true
      advanceSubtitle()
    }
    const onUp = (e: KeyboardEvent) => {
      if (SUBTITLE_ADVANCE_KEYS.has(e.key.toLowerCase())) {
        subtitleKeyLockRef.current = false
      }
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [advanceSubtitle])

  // ── 스폰 + cat-target 스케줄러 (gameState 토글에 묶음) ──────────────
  useEffect(() => {
    if (gameState !== 'playing') return

    startSpawnScheduler({
      refs: refs.current,
      getLevel: () => refs.current.scoreMirror.level,
      getNow: () => performance.now(),
      // 2단계 스폰 — 먼저 경고 마커를 push, PIGEON_WARN_DURATION 후 마커 제거 + 비둘기 실제 스폰.
      // edge는 wave 시스템(spawn.ts)이 셔플해 전달. forcedEdge 없으면 spawnPigeonWarning이 랜덤 선택.
      // stopSpawnScheduler가 호출되면 trackedTimeout이 일괄 정리되어 마커 제거 콜백도 취소되므로,
      // 스폰 스케줄러는 stop 시 잔여 warnings를 함께 비운다(spawn.ts).
      spawnPigeon: (edge) => {
        const now = performance.now()
        const { wid, spawnX, spawnY } = spawnPigeonWarning(
          refs.current,
          now,
          edge,
        )
        trackedTimeout(() => {
          removeWarning(refs.current, wid)
          commitPigeonAt(refs.current, spawnX, spawnY, performance.now())
        }, PIGEON_WARN_DURATION)
      },
      spawnItem: (kind: SoloSpawnKind) =>
        spawnItem(refs.current, kind, performance.now()),
      showToast,
      getPigeonSpawnMul: () => equippedEffectsRef.current.pigeonSpawnMul ?? 1,
      getItemSpawnMul: () => equippedEffectsRef.current.itemSpawnMul ?? 1,
      getPigeonDisabled: () =>
        equippedEffectsRef.current.pigeonDisabled ?? false,
      getWeddingItemMode: () =>
        equippedEffectsRef.current.itemPoolOverride === 'wedding',
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
  }, [gameState, isPlaying, showToast])

  // ── 메인 게임 루프 ─────────────────────────────────────────────────
  useGameLoop({
    enabled: gameState === 'playing',
    update: (dt, now) => {
      const r = refs.current
      const level = r.scoreMirror.level
      const fx = equippedEffectsRef.current

      applyChiPhysics(r, now, dt, () => level, undefined, fx.chiSpeedMul ?? 1)
      updateCatFlee(r, level, now, dt, fx.catSpeedMul ?? 1)
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

  // ── propose 컷신 루프 ──────────────────────────────────────────────
  // story 동안만 활성. updateStory가 단계 전이 + chi 이동/점프 보간 + 이펙트 트리거.
  // 일반 루프(enabled: playing)는 자동 정지하므로 둘이 동시에 돌지 않는다.
  useGameLoop({
    enabled: gameState === 'story',
    update: (dt, now) => {
      const r = refs.current
      // 어느 컷신인지에 따라 분기 — propose는 유저 조작 walk, wedding은 자동 대칭이동 + CG 엔딩.
      if (storyKindRef.current === 'wedding') {
        updateWeddingStory(r, weddingStoryRef.current, dt, now, {
          onModal: handleWeddingStoryModal,
        })
      } else {
        updateStory(r, storyRef.current, dt, now, {
          onModal: handleStoryModal,
        })
      }
      // 가상패드(모바일) 진행 — 이벤트가 안 와 폴링. 에지(0→1)에서만 1회(키 잠금과 분리).
      // subtitle(다음 줄)/credits(스킵) 둘 다 대상. 키보드는 window keydown이 별도 처리.
      const wp = weddingStoryRef.current.phase
      const subtitleVirtualDown =
        storyKindRef.current === 'wedding' &&
        (wp === 'subtitle' || wp === 'credits') &&
        isAnyVirtualDirDown()
      if (subtitleVirtualDown && !subtitleVirtualPrevRef.current) {
        advanceSubtitle()
      }
      subtitleVirtualPrevRef.current = subtitleVirtualDown
      updateParticles(r.particles)
      updateBgHearts(r.bgHearts)
      expireTransients(r, now)
    },
  })

  // ── 게임오버 모달 핸들러 ────────────────────────────────────────────
  // 기록 저장 공용 — 게임오버/스토리 결과 모두 같은 경로(닉네임 캐시 포함).
  const saveRecord = (name: string, info: GameOverInfo) => {
    history.save({
      name,
      score: info.finalScore,
      maxLevel: info.maxLevel,
      maxCombo: info.maxCombo,
      elapsedMs: info.elapsedMs,
    })
    try {
      localStorage.setItem(NICKNAME_KEY, name)
    } catch {
      // 무시
    }
  }

  const handleGameOverSubmit = (name: string) => {
    if (!gameOverInfo) return
    saveRecord(name, gameOverInfo)
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
  // reference 2657 — 비둘기 등장 중(flying)이면 cat scared 스프라이트. 솔로 전용.
  const catScared = r.pigeons.some((p) => p.state === 'flying')

  const chiFacing = chi.facing === 'right' ? -1 : 1
  const catFacing = cat.facing === 'right' ? -1 : 1

  // 컷신 파생값 — story 동안 정장 스프라이트/배경/점프 오프셋/HUD 숨김 분기.
  const isStory = gameState === 'story'
  const storyKind = storyKindRef.current
  const isProposeStory = isStory && storyKind === 'propose'
  const isWeddingStory = isStory && storyKind === 'wedding'
  // propose 컷신 파생 (storyKind==='propose'만).
  const storyKiss = isProposeStory && storyRef.current.phase === 'kiss'
  const storyWalk = isProposeStory && storyRef.current.phase === 'walk'
  const storyChiJumpY = isProposeStory ? storyRef.current.chiJumpY : 0
  const storyCatJumpY = isProposeStory ? storyRef.current.catJumpY : 0
  // walk 중 츄 이동 여부 — 이동 시 토독토독, 정지 시 idle. dead-zone(0.05) 위로 살짝 마진.
  const chiWalking = storyWalk && Math.hypot(chi.vx, chi.vy) > 0.1
  // walk 중 냐는 제자리 idle bob (이동 안 함).
  const catIdleBob = storyWalk
  // wedding 엔딩 컷신 파생 — walk(유저조작+냐 거울, 둘 다 토독토독), kiss 흔들림, fade/cg/subtitle/modal 오버레이.
  const weddingPhase = isWeddingStory ? weddingStoryRef.current.phase : null
  const weddingWalk = weddingPhase === 'walk'
  const weddingKiss = weddingPhase === 'kiss'
  const weddingSubtitle = weddingPhase === 'subtitle'
  const weddingCredits = weddingPhase === 'credits'
  // 현재 자막 줄 — subtitle 단계에서만 의미. 인덱스 안전 클램프. 캐릭터 대사는 italic.
  const weddingSubtitleEntry = weddingSubtitle
    ? SUBTITLE_LINES[weddingStoryRef.current.subtitleIndex]
    : undefined
  const weddingSubtitleLine = weddingSubtitleEntry?.text ?? ''
  const weddingSubtitleItalic = weddingSubtitleEntry?.italic ?? false

  // ── BGM 씬 매핑 (B3a) — 상태/phase → 곡 토큰. 토큰이 바뀔 때만 effect 1회 발화(매 프레임 X).
  //   playing: 웨딩 플레이(weddingArmed)는 title, 일반은 main.
  //   paused/confirmQuit: calm(멈춤 연장선). 게임오버: sfx 1회 + 무음.
  //   컷신: walk~kiss~cg~subtitle 무음. wedding credits/modal만 main(떡밥회수, modal까지 유지).
  let audioScene:
    | 'main'
    | 'title'
    | 'calm'
    | 'gameover'
    | 'silent'
    | 'creditsMain'
  if (gameState === 'gameover') {
    audioScene = 'gameover'
  } else if (gameState === 'paused' || gameState === 'confirmQuit') {
    audioScene = 'calm'
  } else if (isStory) {
    audioScene =
      isWeddingStory && (weddingPhase === 'credits' || weddingPhase === 'modal')
        ? 'creditsMain'
        : 'silent'
  } else {
    audioScene = weddingArmedRef.current ? 'title' : 'main'
  }

  // 첫 마운트(playing) 곡도 이 effect가 보장 — startGame은 첫 진입엔 안 불림(초기 state=playing).
  useEffect(() => {
    switch (audioScene) {
      case 'main':
        audioManager.playBgm('bgmMain')
        break
      case 'title':
        audioManager.playBgm('bgmTitle')
        break
      case 'calm':
        audioManager.playBgm('bgmCalm')
        break
      case 'creditsMain':
        audioManager.playBgm('bgmMain', { crossfade: true })
        break
      case 'gameover':
        audioManager.playSfx('sfxGameover')
        break
      case 'silent':
        audioManager.stopBgm({ fade: true })
        break
    }
  }, [audioScene])

  // story 중엔 getBackgroundForLevel 우회. propose는 bgPropose(야경 호텔), wedding은 제단(LV5 배경) 유지.
  // (wedding CG phase부터는 페이드+CG가 배경을 덮음.)
  const bgUrl = isStory
    ? isWeddingStory
      ? WEDDING_BGS[WEDDING_BGS.length - 1]
      : BG_PROPOSE
    : getBackgroundForLevel(
        sm.level,
        equippedEffectsRef.current.itemPoolOverride === 'wedding',
      )

  return (
    <>
      <div
        className={clsx(
          'absolute inset-0 overflow-hidden',
          (gameState === 'gameover' || storyKiss || weddingKiss) &&
            'animate-game-stage-shake',
        )}
        style={{
          background: `url(${bgUrl}) center / cover no-repeat`,
          transition: 'background 0.6s ease',
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
              {item.kind === 'weddingRing' && <WeddingRing />}
              {item.kind === 'weddingInvitation' && <WeddingInvitation />}
              {item.kind === 'weddingBouquet' && <WeddingBouquet />}
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
            top: chi.y + storyChiJumpY,
            width: CHARACTER_BOX,
            height: CHARACTER_BOX,
            transform: `translate(-50%, -50%) scaleX(${chiFacing})`,
          }}
        >
          <div
            key={`chi-shake-${r.kissing.until}`}
            className={clsx(
              chiKissing && 'animate-kiss-shake',
              // propose walk: 이동 중이면 토독토독, 정지면 idle bob (kiss 중엔 미적용).
              !chiKissing && chiWalking && 'animate-toddok',
              !chiKissing && storyWalk && !chiWalking && 'animate-bounce-soft',
              // wedding walk: 자동 대칭이동이라 항상 토독토독.
              !chiKissing && weddingWalk && 'animate-toddok',
            )}
          >
            <Chihuahua
              kissing={chiKissing}
              boosted={!isStory && chiBoosted}
              mega={!isStory && chiMega}
              slowed={!isStory && chiSlowed}
              equippedSrc={equippedSkinRef.current}
              armed={armedRef.current}
              story={isProposeStory}
              weddingSkin={weddingSkinRef.current}
            />
          </div>
        </div>

        {/* 고양이 + 쉴드 거품 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: cat.x,
            top: cat.y + storyCatJumpY,
            width: CHARACTER_BOX,
            height: CHARACTER_BOX,
            transform: `translate(-50%, -50%) scaleX(${catFacing})`,
          }}
        >
          {/* inner div — kiss 시 kiss-bounce keyframe(통통 2번 점프).
              key=kissing.until → 매 kiss마다 inner remount → animation 재시작. */}
          <div
            key={`cat-bounce-${r.kissing.until}`}
            className={clsx(
              catKissing && 'animate-kiss-bounce',
              // propose walk: 냐는 제자리 idle bob (kiss 중엔 미적용).
              !catKissing && catIdleBob && 'animate-bounce-soft',
              // wedding walk: 냐도 자동 대칭이동(우→중앙)이라 토독토독.
              !catKissing && weddingWalk && 'animate-toddok',
            )}
          >
            <Cat
              kissing={catKissing}
              shielded={!isStory && catShielded}
              angry={!isStory && catAngry}
              scared={!isStory && catScared}
              equippedSrc={equippedCatSkinRef.current}
              armed={armedRef.current}
              story={isProposeStory}
              weddingSkin={weddingSkinRef.current}
            />
          </div>
        </div>
        {!isStory && catShielded && (
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
            className="animate-warn-pulse pointer-events-none absolute z-7"
            style={{ left: w.x, top: w.y }}
          >
            <div className="bg-danger border-ink-base font-display text-text-on-pink shadow-card -translate-x-1/2 -translate-y-1/2 rounded-lg border-[3px] border-solid px-2.5 py-1 text-lg leading-none whitespace-nowrap">
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

        {/* HUD (좌상단 점수 + 우상단 LV/효과 게이지/토스트 stack) / 콤보 라벨 / 오버레이 / 플로트 텍스트
            컷신(story) 중엔 HUD 숨김 — 점수/레벨/게이지 미표시로 연출 몰입. */}
        {!isStory && (
          <HUD
            score={sm.score}
            level={sm.level}
            effects={effects}
            now={now}
            toasts={toasts}
          />
        )}
        <ComboLabel combo={sm.combo} visible={gameState === 'playing'} />
        {/* 레벨업 효과 — z 18 (HUD/콤보 위) */}
        <LevelUpEffect state={r.levelUpEffect} now={now} />
        <FloatTexts items={r.floatTexts} now={now} />

        {/* 게임오버 빨간 플래시 — 카드 전체 위에 1회 페이드. 모달보다 아래(모달은 portal/z-100). */}
        {gameState === 'gameover' && (
          <div className="animate-game-stage-flash pointer-events-none absolute inset-0 bg-[rgba(255,51,68,0.5)]" />
        )}

        {/* 컷신 walk 안내 배너 — 상단중앙, walk 단계 동안만. kiss 도달 시 사라짐.
            HUD 숨김 상태라 z 충돌 적음. 핑크/잉크 톤, 토큰 클래스만 사용. */}
        {storyWalk && (
          <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2">
            <div className="border-ink-base text-text-on-pink shadow-card font-display rounded-pill border-[3px] border-solid bg-pink-700 px-4 py-2 text-base leading-none whitespace-nowrap">
              츄와와의 고백을 완성시켜줘!
            </div>
          </div>
        )}

        {/* wedding walk 안내 배너 — propose 배너 미러. 좌우 조작으로 가운데서 만나도록 유도. */}
        {weddingWalk && (
          <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2">
            <div className="border-ink-base text-text-on-pink shadow-card font-display rounded-pill border-[3px] border-solid bg-pink-700 px-4 py-2 text-base leading-none whitespace-nowrap">
              평생 함께할 것을 뽀뽀로 증명하자!
            </div>
          </div>
        )}

        {/* wedding 엔딩 — 검정 페이드 → CG 풀스크린(3초) → 자막 6줄(유저 진행) → 모달 직전 블러.
            fade: 검정 0→1 페이드 인. cg/subtitle/modal: 검정 유지 + CG(contain, 위아래 검정 레터박스).
            subtitle: 하단 검정띠에 자막 + ▽. modal: CG 위 블러+딤(페이드 인).
            검정/딤은 1회성 로직이라 rgba 직접 허용(위임 명시). z는 게임요소 위, 모달(portal z-100) 아래. */}
        {isWeddingStory &&
          (weddingPhase === 'fade' ||
            weddingPhase === 'cg' ||
            weddingPhase === 'subtitle' ||
            weddingPhase === 'modal') && (
            <>
              <div
                className={clsx(
                  'pointer-events-none absolute inset-0 z-40',
                  weddingPhase === 'fade' && 'animate-wedding-fade-black',
                )}
                style={{
                  background: 'rgba(0, 0, 0, 1)',
                  ...(weddingPhase === 'fade' ? null : { opacity: 1 }),
                }}
              />
              {(weddingPhase === 'cg' ||
                weddingPhase === 'subtitle' ||
                weddingPhase === 'modal') && (
                <img
                  src={CHARACTER_ASSETS.chiCatWeddingCg}
                  alt=""
                  draggable={false}
                  className={clsx(
                    'pointer-events-none absolute inset-0 z-45 h-full w-full object-contain',
                    // cg 단계에서만 fade-in 클래스 — subtitle/modal 전환 시 클래스 제거되어 재생 안 됨.
                    // (페이드는 cg 3초 안에 완료, 클래스 제거 후 opacity 기본값 1로 그대로 유지.)
                    weddingPhase === 'cg' && 'animate-wedding-cg-in',
                  )}
                />
              )}
              {/* 자막 — CG 아래 검정 레터박스 띠. 클릭으로도 진행(div pointer-events-auto).
                  ▽는 다음 진행 신호로 깜빡임. 각 줄 진입 시 페이드 인. */}
              {weddingSubtitle && (
                <button
                  type="button"
                  onClick={advanceSubtitle}
                  aria-label="다음"
                  className="absolute inset-x-0 bottom-0 z-50 flex w-full cursor-pointer flex-col items-center gap-2 px-6 pb-2"
                >
                  <span
                    key={weddingStoryRef.current.subtitleIndex}
                    className={clsx(
                      'animate-wedding-fade-subtitle text-text-on-pink font-display block text-center text-base leading-relaxed',
                      weddingSubtitleItalic && 'italic',
                    )}
                  >
                    {weddingSubtitleLine}
                  </span>
                  <span className="animate-subtitle-blink text-text-on-pink font-display block text-base leading-none">
                    ▽
                  </span>
                </button>
              )}
              {weddingPhase === 'modal' && (
                <div className="animate-wedding-fade-dim pointer-events-none absolute inset-0 z-48 bg-[rgba(0,0,0,0.25)] backdrop-blur-sm" />
              )}
            </>
          )}

        {/* wedding 엔딩 크레딧 — 검정 위 세로 스크롤(아래→위). 클릭/키/가상패드로 스킵.
            텍스트만 스크롤, 양옆 댄스는 화면 고정 통통. 검정은 1회성 로직이라 rgba 직접 허용. */}
        {isWeddingStory && weddingCredits && (
          <div
            onClick={advanceSubtitle}
            className="absolute inset-0 z-40 cursor-pointer overflow-hidden"
            style={{ background: 'rgba(0, 0, 0, 1)' }}
          >
            {/* 스크롤 컨텐츠 — wrapper가 min-h-full 이상이라 시작/끝 모두 화면 밖 */}
            <div className="animate-wedding-credits-scroll gap-xl absolute inset-x-0 top-0 flex min-h-full flex-col items-center justify-center px-6 text-center">
              <img
                src={TITLE_LOGO}
                alt=""
                draggable={false}
                className="animate-wedding-title-wave w-[65%] max-w-[65%] object-contain"
              />
              <span className="text-text-on-pink font-display text-lg leading-relaxed">
                츄와와 ~뽀뽀 돌격~
              </span>

              <div className="gap-sm flex flex-col items-center">
                <span className="text-text-on-pink font-display text-sm opacity-80">
                  제작
                </span>
                <span className="text-text-on-pink font-display text-base leading-relaxed">
                  김co수
                </span>
                <span className="text-text-on-pink font-display text-base leading-relaxed">
                  워워
                </span>
              </div>

              {/* 데이콘 영역 — 위/아래 점선(게임 카드 스타일, pink-300 dashed) + 안쪽 넉넉한 패딩 */}
              <div className="gap-sm flex flex-col items-center border-y-2 border-dashed border-pink-300 px-10 py-8">
                <span className="text-text-on-pink font-display text-base leading-relaxed">
                  데이콘 월간 해커톤
                </span>
                <span className="text-text-on-pink font-display text-sm leading-relaxed opacity-80">
                  10분 안에 중독시켜라
                </span>
                <span className="text-text-on-pink font-display text-sm leading-relaxed opacity-80">
                  — 웹 미니게임 챌린지 —
                </span>
              </div>

              <span className="text-text-on-pink font-display text-lg leading-relaxed">
                Thanks to play
              </span>
            </div>

            {/* 양옆 댄스 — 좌우 끝 세로중앙 고정, 통통 + 2바운스마다 좌우반전(스무스).
                3층 분리(각 층 transform 1종): wrapper(정렬 -translate-y-1/2) /
                flip 레이어(scaleX 반전) / inner img(bounce translateY) — 서로 안 덮음. */}
            <div className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2">
              <div className="animate-wedding-dance-flip">
                <img
                  src={CHARACTER_ASSETS.chiWeddingDance}
                  alt=""
                  draggable={false}
                  className="animate-bounce-soft w-24 object-contain"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute top-1/2 right-4 z-10 -translate-y-1/2">
              <div className="animate-wedding-dance-flip">
                <img
                  src={CHARACTER_ASSETS.catWeddingDance}
                  alt=""
                  draggable={false}
                  className="animate-bounce-soft w-24 object-contain"
                />
              </div>
            </div>
          </div>
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

      {/* 컷신 성공 결과 모달 — GameOverModal 재활용(variant='story'). 점수/LV10 + 닉네임 등록 +
          코인 + [메인으로]. 해금(proposeEndingCleared)/코인은 handleStoryModal에서 모달 표시 시 처리.
          blocker는 story를 in-progress로 안 봐서 메인 이동 허용. */}
      {showStoryModal && storyResult && (
        <GameOverModal
          open
          variant="story"
          info={storyResult}
          rank={history.getRank(storyResult.finalScore)}
          defaultName={defaultName}
          onSubmit={(name) => saveRecord(name, storyResult)}
          onMain={() => navigate({ to: '/' })}
          // wedding 엔딩이면 Happy Ending 문구. propose는 기본값(미전달).
          {...(storyKindRef.current === 'wedding'
            ? {
                storyTitle: 'Happy Ending',
                storyHeading: 'Happy Ending',
                storySubtitle: '오래오래 행복하게 뽀뽀했답니다!',
              }
            : {})}
        />
      )}

      {/* 일시정지/그만두기 모달 (gameover와 동일하게 라우트 레벨 portal/overlay) */}
      <PauseModal open={gameState === 'paused'} onResume={togglePause} />
      <QuitConfirmModal
        open={gameState === 'confirmQuit'}
        onCancel={cancelQuit}
        onConfirm={confirmQuitGame}
      />

      {/* 이탈 confirm — blocker가 잡은 페이지 이탈 시도용. 게임오버 처리 없이 그냥 나감.
          "더 놀래"=reset(이동 취소), "나가기"=proceed(이동 진행, 기록 저장 X). */}
      <QuitConfirmModal
        open={leaveBlocker.status === 'blocked'}
        onCancel={() => leaveBlocker.reset?.()}
        onConfirm={() => leaveBlocker.proceed?.()}
        title="게임을 나갈까요?"
        cancelLabel="더 놀래"
        confirmLabel="나가기"
      >
        <p className="text-text-primary font-body py-2 text-sm leading-relaxed">
          지금 나가면 이번 판 점수가
          <br />
          저장되지 않아요
        </p>
      </QuitConfirmModal>

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
