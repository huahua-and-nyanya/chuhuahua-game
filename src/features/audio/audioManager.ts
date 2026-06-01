import { AUDIO_ASSETS, type BgmTrack, type SfxTrack } from '@/assets/audio'

// 오디오 재생 엔진 — 모듈 싱글톤(Context 아님, virtualInput 등 기존 모듈 패턴 미러).
// B1은 엔진만 제공. "어느 곡을 언제"는 B2(라우트)/B3(상태)가 호출한다.
//
// 설계 메모:
// - 트랙별 HTMLAudioElement를 lazy 생성·보관 → 같은 트랙 재생 중 재호출은 위치 유지(no-op).
// - 전역 음소거는 el.muted 토글 — 곡 진행(currentTime)은 유지되고 소리만 차단, 해제 시 즉시 들림.
// - 크로스페이드는 el.volume ramp로 처리(muted와 독립) → muted 상태에서도 fade 로직은 정상.
// - 자동재생 정책: 첫 유저 상호작용 전 play()는 거부될 수 있어, 첫 상호작용까지 트랙을 pending에 보관.

const MUTED_KEY = 'chuhuahua:audio-muted'

const BGM_VOLUME = 0.6
const SFX_VOLUME = 0.85
const CROSSFADE_MS = 500
const FADE_STEP_MS = 25

// ── 모듈 상태 ────────────────────────────────────────────────
let muted = readStoredMuted()
let armed = false
// 논리적 현재 bgm 트랙(재생 중이어야 하는 것). 같은 트랙 재호출 no-op 판정 기준.
let currentBgmTrack: BgmTrack | null = null
// arm 전에 요청된 트랙 — 첫 상호작용 시 재생.
let pendingBgmTrack: BgmTrack | null = null

const bgmEls = new Map<BgmTrack, HTMLAudioElement>()
let sfxEl: HTMLAudioElement | null = null
const fadeTimers = new Map<HTMLAudioElement, ReturnType<typeof setInterval>>()

const listeners = new Set<() => void>()

// ── 유틸 ─────────────────────────────────────────────────────
function readStoredMuted(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(MUTED_KEY) === 'true'
}

function* allEls(): Generator<HTMLAudioElement> {
  for (const el of bgmEls.values()) yield el
  if (sfxEl) yield sfxEl
}

function getBgmEl(track: BgmTrack): HTMLAudioElement {
  let el = bgmEls.get(track)
  if (!el) {
    el = new Audio(AUDIO_ASSETS[track])
    el.loop = true
    el.preload = 'auto'
    el.volume = 0
    el.muted = muted
    bgmEls.set(track, el)
  }
  return el
}

function getSfxEl(track: SfxTrack): HTMLAudioElement {
  if (!sfxEl) {
    sfxEl = new Audio(AUDIO_ASSETS[track])
    sfxEl.loop = false
    sfxEl.preload = 'auto'
    sfxEl.muted = muted
  }
  return sfxEl
}

function clearFade(el: HTMLAudioElement): void {
  const t = fadeTimers.get(el)
  if (t !== undefined) {
    clearInterval(t)
    fadeTimers.delete(el)
  }
}

// el.volume을 target까지 durationMs 동안 선형 ramp. 진행 중 ramp는 취소하고 덮어씀.
function fadeTo(
  el: HTMLAudioElement,
  target: number,
  durationMs: number,
  onDone?: () => void,
): void {
  clearFade(el)
  const start = el.volume
  if (durationMs <= 0) {
    el.volume = clamp01(target)
    onDone?.()
    return
  }
  const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS))
  let i = 0
  const id = setInterval(() => {
    i += 1
    el.volume = clamp01(start + (target - start) * (i / steps))
    if (i >= steps) {
      clearFade(el)
      onDone?.()
    }
  }, FADE_STEP_MS)
  fadeTimers.set(el, id)
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function safePlay(el: HTMLAudioElement): void {
  // 오디오 실패(정책 차단/로드 실패)가 게임 흐름을 막지 않게 — 항상 무시.
  try {
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch {
    // 무시
  }
}

function emit(): void {
  for (const l of listeners) l()
}

// ── bgm 전환 ─────────────────────────────────────────────────
function startBgm(track: BgmTrack, crossfade: boolean): void {
  const dur = crossfade ? CROSSFADE_MS : 0
  const target = getBgmEl(track)
  target.muted = muted

  // 다른 트랙들은 fadeout 후 정지(위치는 유지 — 다음에 그 트랙으로 돌아오면 이어짐).
  for (const [t, el] of bgmEls) {
    if (t === track) continue
    fadeTo(el, 0, dur, () => el.pause())
  }

  safePlay(target)
  fadeTo(target, BGM_VOLUME, dur)
}

// ── 공개 API ─────────────────────────────────────────────────
function playBgm(track: BgmTrack, opts?: { crossfade?: boolean }): void {
  // 이미 같은 트랙이면 no-op — 곡 이어짐(재시작 X). arm 전 pending 상태도 동일 판정.
  if (currentBgmTrack === track) return
  currentBgmTrack = track

  if (!armed) {
    // 첫 상호작용 전 — 보관만. arm 시 재생.
    pendingBgmTrack = track
    return
  }
  pendingBgmTrack = null
  startBgm(track, opts?.crossfade ?? true)
}

function stopBgm(opts?: { fade?: boolean }): void {
  currentBgmTrack = null
  pendingBgmTrack = null
  const dur = (opts?.fade ?? true) ? CROSSFADE_MS : 0
  for (const el of bgmEls.values()) {
    fadeTo(el, 0, dur, () => el.pause())
  }
}

function playSfx(track: SfxTrack): void {
  // sfx 재생 시 현 bgm 정지(즉시).
  stopBgm({ fade: false })
  const el = getSfxEl(track)
  el.muted = muted
  el.volume = SFX_VOLUME
  try {
    el.currentTime = 0
  } catch {
    // 무시
  }
  safePlay(el)
}

function setMuted(next: boolean): void {
  if (muted === next) return
  muted = next
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUTED_KEY, String(next))
  }
  for (const el of allEls()) el.muted = next
  emit()
}

function getMuted(): boolean {
  return muted
}

// 첫 유저 상호작용 시 1회 — 자동재생 정책 우회 + 대기 트랙 재생.
function armAudio(): void {
  if (armed) return
  armed = true
  if (pendingBgmTrack) {
    const t = pendingBgmTrack
    pendingBgmTrack = null
    startBgm(t, false)
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// ── 첫 상호작용 리스너(자동 등록) ───────────────────────────────
// pointerdown/keydown 어느 쪽이든 첫 발화 시 armAudio → 양쪽 리스너 제거.
if (typeof window !== 'undefined') {
  const onFirstInteract = () => {
    window.removeEventListener('pointerdown', onFirstInteract)
    window.removeEventListener('keydown', onFirstInteract)
    armAudio()
  }
  window.addEventListener('pointerdown', onFirstInteract)
  window.addEventListener('keydown', onFirstInteract)
}

export const audioManager = {
  playBgm,
  stopBgm,
  playSfx,
  setMuted,
  getMuted,
  armAudio,
  subscribe,
}
