import { applyChiPhysics } from '@/game/ai/chi-input'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  KISS_DIST,
  MWAH_DURATION,
} from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { addParticles } from '@/game/particles'
import type { ParticleRef } from '@/game/state'

// propose 코스튬 스토리 컷신 상태머신 (사이클 W S2).
// 일반 게임 루프와 분리 — solo.tsx가 gameState==='story' 동안 별도 useGameLoop로 updateStory 호출.
// 전이: intro →(타이밍)→ walk →(유저가 츄를 냐 KISS_DIST까지 데려감)→ kiss →(타이밍)→ jump →(타이밍)→ modal.
// walk는 자동이동 아님 — 유저가 직접 츄 조작(매우 느림). 도달까지 타임아웃 없이 무한 대기.

export type StoryPhase = 'intro' | 'walk' | 'kiss' | 'jump' | 'modal'

export type StoryRuntime = {
  phase: StoryPhase
  phaseStartAt: number // performance.now() — 현 단계 진입 시각
  chiJumpY: number // jump 단계 렌더 y 오프셋 (px, 음수=위)
  catJumpY: number
  heartAccum: number // walk 단계 하트 스폰 간격 누적 (ms)
}

export function createStoryRuntime(): StoryRuntime {
  return {
    phase: 'intro',
    phaseStartAt: 0,
    chiJumpY: 0,
    catJumpY: 0,
    heartAccum: 0,
  }
}

// 단계별 길이 — STORY_ASSETS.md 타이밍 락 범위 내 고정값.
const INTRO_MS = 1000 // 락 800~1200
// WALK는 타임아웃 없음 — 유저가 츄를 냐 KISS_DIST까지 데려갈 때까지 무한 대기.
const KISS_MS = 1500 // 락 1200~1800
const JUMP_MS = 1800 // 락 1500~2000

// walk 전용 츄 이동 속도 배율 — MAX_SPEED(3.4)에 곱해 매우 느린 토독토독 보행.
// 일반 플레이엔 영향 없음 (walk case에서만 applyChiPhysics에 전달).
const STORY_WALK_SPEED_MUL = 0.3

const WALK_HEART_INTERVAL = 320 // ms, walk 중 하트 간헐 스폰 간격
const JUMP_HOPS = 3 // sine 점프 횟수
const JUMP_AMPLITUDE = 32 // px, 점프 높이

// 캐릭터 배치 — ENDING_SPEC §2 (좌우 끝, y 중앙).
export const STORY_CHI_X = 70
export const STORY_CAT_X = GAME_WIDTH - 70
export const STORY_Y = GAME_HEIGHT / 2

// 로직 모듈 1회성 파티클 색상 (스타일 정책 예외 — Particles 팔레트와 동일 계열).
const HEART_COLORS = ['#ff85a1', '#ffadc6', '#ff3d7f', '#ffd1dc']
const JUMP_COLORS = ['#fbbf24', '#ff3d7f', '#fcd34d', '#ffadc6', '#ffeb3b']

function enterPhase(story: StoryRuntime, phase: StoryPhase, now: number): void {
  story.phase = phase
  story.phaseStartAt = now
}

// 컷신 진입 — 오브젝트/효과 리셋 + 캐릭터 정장 idle로 좌우 끝 텔레포트.
// 트리거 시점(onLevelUp)에 1회 동기 호출. 이후 updateStory가 phase를 진행.
export function setupStory(
  refs: GameRefs,
  now: number,
  story: StoryRuntime,
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
  story.chiJumpY = 0
  story.catJumpY = 0
  story.heartAccum = 0
}

export type StoryCallbacks = {
  // 마지막 단계 진입 시 placeholder 모달 표시 (React state 토글) — route 책임.
  onModal: () => void
}

// 매 RAF 프레임 호출 (story 루프). 단계 전이 + chi 이동/점프 보간 + 이펙트 트리거.
export function updateStory(
  refs: GameRefs,
  story: StoryRuntime,
  dt: number,
  now: number,
  cb: StoryCallbacks,
): void {
  const elapsed = now - story.phaseStartAt
  switch (story.phase) {
    case 'intro':
      if (elapsed >= INTRO_MS) enterPhase(story, 'walk', now)
      break
    case 'walk': {
      // 유저 조작 — 일반 솔로와 같은 입력 경로(applyChiPhysics, WASD+방향키). walk 전용 느린 배율만.
      // getLevel은 호환 인자(미사용), getMode 미지정=solo. facing은 입력에 따라 갱신됨.
      applyChiPhysics(refs, now, dt, () => 0, undefined, STORY_WALK_SPEED_MUL)
      story.heartAccum += dt
      if (story.heartAccum >= WALK_HEART_INTERVAL) {
        story.heartAccum -= WALK_HEART_INTERVAL
        spawnWalkHeart(refs, now)
      }
      // 타임아웃 없음 — 츄가 냐 KISS_DIST 안으로 들어올 때까지 무한 대기.
      const dx = refs.cat.x - refs.chi.x
      const dy = refs.cat.y - refs.chi.y
      if (Math.hypot(dx, dy) <= KISS_DIST) {
        triggerStoryKiss(refs, now)
        enterPhase(story, 'kiss', now)
      }
      break
    }
    case 'kiss':
      if (elapsed >= KISS_MS) {
        triggerStoryJump(refs, now)
        enterPhase(story, 'jump', now)
      }
      break
    case 'jump': {
      const t = Math.min(1, elapsed / JUMP_MS)
      const offset =
        -Math.abs(Math.sin(t * Math.PI * JUMP_HOPS)) * JUMP_AMPLITUDE
      story.chiJumpY = offset
      story.catJumpY = offset
      if (t >= 1) {
        story.chiJumpY = 0
        story.catJumpY = 0
        cb.onModal()
        enterPhase(story, 'modal', now)
      }
      break
    }
    case 'modal':
      break
  }
}

// walk 중 작은 하트 1개 — chi 위에서 살짝 떠오름.
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

// kiss 진입 — mwah + 볼하트 폭발. kissing 플래그도 켜 스프라이트/흔들림 연동.
function triggerStoryKiss(refs: GameRefs, now: number): void {
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

// jump 진입 — 중앙 하트 대량 폭발 + shockwave 1회.
function triggerStoryJump(refs: GameRefs, now: number): void {
  const cx = GAME_WIDTH / 2
  const cy = GAME_HEIGHT / 2
  const burst: ParticleRef[] = []
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    const speed = 5 + Math.random() * 5
    burst.push({
      id: now + i + Math.random(),
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      vr: (Math.random() - 0.5) * 18,
      rot: Math.random() * 360,
      size: 16 + Math.random() * 12,
      life: 34 + Math.random() * 14,
      color: JUMP_COLORS[i % JUMP_COLORS.length],
    })
  }
  addParticles(refs.particles, burst)
  refs.shockwaves.push({
    id: now + Math.random(),
    x: cx,
    y: cy,
    until: now + 300,
  })
}
