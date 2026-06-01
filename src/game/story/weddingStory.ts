import { GAME_WIDTH, KISS_DIST, MWAH_DURATION } from '@/game/constants'
import type { GameRefs } from '@/game/loop/state'
import { addParticles } from '@/game/particles'
import type { ParticleRef } from '@/game/state'
import { STORY_CAT_X, STORY_CHI_X, STORY_Y } from './proposeStory'

// wedding(S+) 엔딩 컷신 상태머신 (사이클 W3a).
// proposeStory 패턴 미러 — solo.tsx가 gameState==='story' 동안 storyKind='wedding'으로 분기 호출.
// proposeStory와 다른 점:
//   - walk가 유저 조작이 아니라 양쪽 자동 대칭이동(츄 좌→중앙, 냐 우→중앙).
//   - jump 단계 없음. kiss 후 검정 페이드 → CG 풀스크린(3초, 스킵불가) → 모달.
// 전이: intro →(타이밍)→ walk →(둘이 KISS_DIST 도달)→ kiss →(타이밍)→ fade →(타이밍)→ cg →(타이밍)→ modal.

export type WeddingPhase = 'intro' | 'walk' | 'kiss' | 'fade' | 'cg' | 'modal'

export type WeddingStoryRuntime = {
  phase: WeddingPhase
  phaseStartAt: number // performance.now() — 현 단계 진입 시각
  heartAccum: number // walk 단계 하트 스폰 간격 누적 (ms)
}

export function createWeddingStoryRuntime(): WeddingStoryRuntime {
  return {
    phase: 'intro',
    phaseStartAt: 0,
    heartAccum: 0,
  }
}

// 단계별 길이. WALK_MS는 임의 선택값(proposeStory의 walk는 유저 무한대기라 미러 대상 아님).
const INTRO_MS = 800
const WALK_MS = 2000 // 대칭 이동 — 양쪽이 중앙에서 만나기까지 (임의값)
const KISS_MS = 1500 // proposeStory KISS_MS와 동일 톤
// 검정 페이드 인 지속 — globals.css --animate-wedding-fade-in과 일치시킬 것.
export const WEDDING_FADE_MS = 500
const CG_MS = 3000 // CG 풀스크린 표시 (스킵 불가)

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
}

export type WeddingStoryCallbacks = {
  // cg 단계 종료 시 모달 표시 (React state 토글) — route 책임.
  onModal: () => void
}

// 매 RAF 프레임 호출 (story 루프, storyKind='wedding'). 단계 전이 + 양방향 대칭이동 + 이펙트 트리거.
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
      // 양쪽 자동 대칭이동 — 츄 좌→중앙, 냐 우→중앙. 거울 대칭이라 항상 중앙에서 만난다.
      const t = Math.min(1, elapsed / WALK_MS)
      const midX = GAME_WIDTH / 2
      refs.chi.x = STORY_CHI_X + (midX - STORY_CHI_X) * t
      refs.cat.x = STORY_CAT_X + (midX - STORY_CAT_X) * t
      refs.chi.facing = 'right'
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
      if (elapsed >= CG_MS) {
        cb.onModal()
        enterPhase(story, 'modal', now)
      }
      break
    case 'modal':
      break
  }
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
