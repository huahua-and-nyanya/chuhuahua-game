import { applyChiPhysics } from '@/game/ai/chi-input'
import { GAME_WIDTH, KISS_DIST, MWAH_DURATION } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { addParticles } from '@/game/particles'
import type { ParticleRef } from '@/game/state'
import {
  STORY_CAT_X,
  STORY_CHI_X,
  STORY_WALK_SPEED_MUL,
  STORY_Y,
} from './proposeStory'

// wedding(S+) 엔딩 컷신 상태머신 (사이클 W3a-v2).
// proposeStory 패턴 미러 — solo.tsx가 gameState==='story' 동안 storyKind='wedding'으로 분기 호출.
// proposeStory와 다른 점:
//   - walk: 유저가 츄를 좌우로만 조작(applyChiPhysics), 냐는 츄의 거울 대칭(midX 기준). 가운데서 만남.
//   - jump 단계 없음. kiss 후 검정 페이드 → CG(3초) → 자막 6줄(유저 진행) → 크레딧 → 모달.
// 전이: intro →(타이밍)→ walk →(둘이 KISS_DIST 도달)→ kiss →(타이밍)→ fade →(타이밍)→ cg
//        →(타이밍)→ subtitle →(유저가 6줄 진행)→ credits →(스크롤 종료 또는 스킵)→ modal.

export type WeddingPhase =
  | 'intro'
  | 'walk'
  | 'kiss'
  | 'fade'
  | 'cg'
  | 'subtitle'
  | 'credits'
  | 'modal'

export type WeddingStoryRuntime = {
  phase: WeddingPhase
  phaseStartAt: number // performance.now() — 현 단계 진입 시각
  heartAccum: number // walk 단계 하트 스폰 간격 누적 (ms)
  subtitleIndex: number // subtitle 단계 현재 줄(0~SUBTITLE_LINES.length-1)
}

// CG 자막 — cg 3초 후 한 줄씩 표시, 유저가 클릭/키/가상패드로 진행 (순서 고정).
// italic: 캐릭터 대사(왈왈/냐옹)는 기울임으로 발화 톤 구분.
export type SubtitleLine = { text: string; italic?: boolean }
export const SUBTITLE_LINES: readonly SubtitleLine[] = [
  { text: '...그렇게 둘은 평생을 약속한 사이가 되었습니다.' },
  { text: '가만, 둘이 무슨 이야기를 나누는지 들어볼까요?' },
  { text: '왈왈, 왈왈왈!', italic: true },
  { text: '냐옹...', italic: true },
  { text: '...뭐라고 하는 건진 모르겠지만, 아무튼 행복해 보입니다!' },
  { text: '둘의 영원한 행복을 만들어줘 고마워요.' },
] as const

export function createWeddingStoryRuntime(): WeddingStoryRuntime {
  return {
    phase: 'intro',
    phaseStartAt: 0,
    heartAccum: 0,
    subtitleIndex: 0,
  }
}

// 단계별 길이.
const INTRO_MS = 800
const KISS_MS = 1500 // proposeStory KISS_MS와 동일 톤
// 검정 페이드 인 지속 — globals.css --animate-wedding-fade-black(1200ms)과 정합.
// fade phase가 이 시간 후 cg로 넘어가므로 CSS 페이드 duration과 같아야 끊김/잘림 없음.
export const WEDDING_FADE_MS = 1200
const CG_MS = 3000 // CG 풀스크린 표시 (자막 없이)
// 크레딧 세로 스크롤 지속 — globals.css --animate-wedding-credits-scroll(28000ms)과 정합.
// credits phase가 이 시간 후 modal로 넘어가므로 CSS 스크롤 duration과 같아야 끝까지 보고 모달 전환.
const CREDITS_MS = 28000

const WALK_HEART_INTERVAL = 320 // ms, walk 중 하트 간헐 스폰 간격

// 로직 모듈 1회성 파티클 색상 (proposeStory와 동일 — Particles 팔레트 계열).
const HEART_COLORS = ['#ff85a1', '#ffadc6', '#ff3d7f', '#ffd1dc']

function enterPhase(
  story: WeddingStoryRuntime,
  phase: WeddingPhase,
  now: number,
): void {
  story.phase = phase
  story.phaseStartAt = now
}

// 컷신 진입 — proposeStory.setupStory 미러. 오브젝트/효과 리셋 + 캐릭터 좌우 끝 텔레포트.
// 트리거 시점(onLevelUp LV5)에 1회 동기 호출. 이후 updateWeddingStory가 phase를 진행.
export function setupWeddingStory(
  refs: GameRefs,
  now: number,
  story: WeddingStoryRuntime,
): void {
  refs.pigeons = []
  refs.warnings = []
  refs.items = []
  refs.particles = []
  refs.shockwaves = []
  refs.floatTexts = []

  const e = refs.effects
  e.chiBoost.until = 0
  e.chiSlow.until = 0
  e.chiSad.until = 0
  e.chiShield.until = 0
  e.catSpeedup.until = 0
  e.catSlow.until = 0
  e.catShield.until = 0
  e.scoreMult.until = 0
  e.scoreMult.value = 1

  refs.kissing.active = false
  refs.mwah.active = false
  refs.levelUpEffect.active = false

  refs.chi.x = STORY_CHI_X
  refs.chi.y = STORY_Y
  refs.chi.vx = 0
  refs.chi.vy = 0
  refs.chi.facing = 'right'
  refs.cat.x = STORY_CAT_X
  refs.cat.y = STORY_Y
  refs.cat.vx = 0
  refs.cat.vy = 0
  refs.cat.facing = 'left'

  story.phase = 'intro'
  story.phaseStartAt = now
  story.heartAccum = 0
  story.subtitleIndex = 0
}

export type WeddingStoryCallbacks = {
  // subtitle 마지막 줄 진행 시 모달 표시 (React state 토글) — route 책임.
  onModal: () => void
}

// 매 RAF 프레임 호출 (story 루프, storyKind='wedding'). 단계 전이 + walk 입력/거울이동 + 이펙트.
// subtitle 진행은 RAF가 아니라 유저 입력(advanceWeddingSubtitle, solo.tsx) 담당 — 여기선 no-op.
export function updateWeddingStory(
  refs: GameRefs,
  story: WeddingStoryRuntime,
  dt: number,
  now: number,
  cb: WeddingStoryCallbacks,
): void {
  const elapsed = now - story.phaseStartAt
  switch (story.phase) {
    case 'intro':
      if (elapsed >= INTRO_MS) enterPhase(story, 'walk', now)
      break
    case 'walk': {
      // 유저가 츄를 좌우로만 조작 (propose walk 미러, 같은 보행 배율). getLevel 미사용, getMode=solo.
      applyChiPhysics(refs, now, dt, () => 0, undefined, STORY_WALK_SPEED_MUL)
      // 좌우만 — 상하 입력 무시(walk 동안 y 고정).
      refs.chi.y = STORY_Y
      refs.chi.facing = 'right'
      // 냐는 츄의 거울(midX 기준 좌우 대칭) — 츄가 가운데로 가면 냐도 가운데로 마주 옴.
      refs.cat.x = GAME_WIDTH - refs.chi.x
      refs.cat.y = STORY_Y
      refs.cat.facing = 'left'
      story.heartAccum += dt
      if (story.heartAccum >= WALK_HEART_INTERVAL) {
        story.heartAccum -= WALK_HEART_INTERVAL
        spawnWalkHeart(refs, now)
      }
      const dx = refs.cat.x - refs.chi.x
      const dy = refs.cat.y - refs.chi.y
      if (Math.hypot(dx, dy) <= KISS_DIST) {
        triggerWeddingKiss(refs, now)
        enterPhase(story, 'kiss', now)
      }
      break
    }
    case 'kiss':
      if (elapsed >= KISS_MS) enterPhase(story, 'fade', now)
      break
    case 'fade':
      if (elapsed >= WEDDING_FADE_MS) enterPhase(story, 'cg', now)
      break
    case 'cg':
      // CG만 3초 → 자막 시퀀스 진입 (자막 0번째 줄부터).
      if (elapsed >= CG_MS) {
        story.subtitleIndex = 0
        enterPhase(story, 'subtitle', now)
      }
      break
    case 'subtitle':
      // 진행은 advanceWeddingSubtitle(유저 입력)이 담당. RAF는 대기.
      break
    case 'credits':
      // 크레딧 스크롤 종료(CREDITS_MS) → 모달. 유저 스킵은 skipWeddingCredits(입력)이 담당.
      if (elapsed >= CREDITS_MS) {
        cb.onModal()
        enterPhase(story, 'modal', now)
      }
      break
    case 'modal':
      break
  }
}

// 자막 한 줄 진행 — 클릭/키/가상패드 1회당 호출(solo.tsx). 중복진행 방지는 호출처가 보장.
// 다음 줄로 넘기고, 마지막 줄에서 진행하면 크레딧 단계로(모달 직결 아님 — credits 후 모달).
export function advanceWeddingSubtitle(
  story: WeddingStoryRuntime,
  now: number,
  _cb: WeddingStoryCallbacks,
): void {
  void _cb
  if (story.phase !== 'subtitle') return
  if (story.subtitleIndex < SUBTITLE_LINES.length - 1) {
    story.subtitleIndex += 1
  } else {
    enterPhase(story, 'credits', now)
  }
}

// 크레딧 스킵 — credits 중 유저 입력(클릭/키/가상패드) 시 즉시 모달. 중복은 호출처(onModal 멱등)가 보장.
export function skipWeddingCredits(
  story: WeddingStoryRuntime,
  now: number,
  cb: WeddingStoryCallbacks,
): void {
  if (story.phase !== 'credits') return
  cb.onModal()
  enterPhase(story, 'modal', now)
}

// walk 중 작은 하트 1개 — chi 위에서 살짝 떠오름 (proposeStory.spawnWalkHeart 미러).
function spawnWalkHeart(refs: GameRefs, now: number): void {
  addParticles(refs.particles, [
    {
      id: now + Math.random(),
      x: refs.chi.x + (Math.random() - 0.5) * 28,
      y: refs.chi.y - 18,
      vx: (Math.random() - 0.5) * 1.0,
      vy: -1.3 - Math.random() * 0.7,
      vr: (Math.random() - 0.5) * 8,
      rot: Math.random() * 360,
      size: 12 + Math.random() * 7,
      life: 32 + Math.random() * 10,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    },
  ])
}

// kiss 진입 — mwah + 볼하트 폭발. kissing 플래그도 켜 웨딩 kissing 스프라이트/흔들림 연동.
// (Chihuahua/Cat의 weddingSkin 분기가 kissing → chi/catWeddingKissing 처리.)
function triggerWeddingKiss(refs: GameRefs, now: number): void {
  const midX = (refs.chi.x + refs.cat.x) / 2
  const midY = (refs.chi.y + refs.cat.y) / 2 - 24
  refs.mwah = { active: true, until: now + MWAH_DURATION, x: midX, y: midY }
  refs.kissing.active = true
  refs.kissing.until = now + KISS_MS
  const hearts: ParticleRef[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const speed = 3 + Math.random() * 2
    hearts.push({
      id: now + i + Math.random(),
      x: midX,
      y: midY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      vr: (Math.random() - 0.5) * 16,
      rot: Math.random() * 360,
      size: 16 + Math.random() * 8,
      life: 30 + Math.random() * 12,
      color: HEART_COLORS[i % HEART_COLORS.length],
    })
  }
  addParticles(refs.particles, hearts)
}
