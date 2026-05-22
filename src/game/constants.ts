// === 게임 영역 ===
export const GAME_WIDTH = 640 // px
export const GAME_HEIGHT = 480 // px
export const RENDER_FPS = 30 // React 렌더 주기 (RAF는 60fps)

// === 캐릭터 ===
export const KISS_DIST = 42 // px, 츄와 ↔ 고양이 뽀뽀 판정 거리
export const KISS_DURATION = 500 // ms, 뽀뽀 무적 시간 (= 2단계 통통 점프 동안 무적 보장)
export const MWAH_DURATION = 700 // ms, "쪽!" 텍스트 표시 시간
export const KISS_DEBOUNCE = 600 // ms, 뽀뽀 재트리거 디바운스 (reference 1776 패턴)
export const KISS_PUSH = 80 // px, 뽀뽀 직후 cat을 chi 반대 4방향(수평/수직 우세)으로 튕김
export const MAX_SPEED = 3.4 // px/frame
export const ACCEL = 0.2 // px/frame²

// === 고양이 AI ===
export const CAT_LERP_BASE = 0.04 // 추격 lerp 계수 (레벨 0, 난이도 강화: 0.032 → 0.040)
export const CAT_LERP_PER_LEVEL = 0.008 // 레벨당 lerp 증가량 (난이도 강화: 0.006 → 0.008)
export const CAT_FLEE_RANGE = 220 // px, 비둘기 회피 반경
export const CAT_FLEE_LERP_MUL = 0.5 // 회피 시 lerp 배수
export const CAT_DASH_THRESHOLD = 80 // px, 츄와 거리 이내면 대시 트리거
export const CAT_DASH_DIST = 130 // px, 대시 이동 거리
export const CAT_DASH_COOLDOWN = 1200 // ms

// === 비둘기 ===
export const PIGEON_SPEED_BASE = 1.6 // px/frame
export const PIGEON_SPEED_PER_LEVEL = 0.25
export const PIGEON_SPAWN_MIN = 2500 // ms, 최소 스폰 간격 (난이도 강화: 3500 → 2500)
export const PIGEON_SPAWN_BASE = 13000 // ms, LV0 기준 스폰 간격
export const PIGEON_SPAWN_PER_LEVEL = 2000 // ms, 레벨당 간격 단축량 (체감 ↑)
export const PIGEON_SCARE_DIST = 60 // px, 츄와의 접근 시 도망 거리
export const PIGEON_HIT_DIST = 30 // px, 피격 판정 거리

// === 아이템 (솔로) ===
export const ITEM_PICKUP_DIST = 38 // px
export const ITEM_LIFETIME = 14000 // ms, 화면 잔존 시간
export const KIBBLE_FIRST_DELAY = 6000 // ms
export const FISH_FIRST_DELAY = 9000 // ms
export const ITEM_RESPAWN_MIN = 8000 // ms
export const ITEM_RESPAWN_MAX = 13000 // ms
// 디버프 아이템 (솔로) — LV3 도달 시 활성. cucumber 먼저, sweetPotato는 추가 stagger 후.
// 재스폰 간격은 kibble/fish보다 길다 (드물게 등장).
export const DEBUFF_AFTER_LV3_FIRST = 8000 // ms, LV3 도달 후 첫 오이 등장까지
export const DEBUFF_STAGGER = 12000 // ms, 오이 첫 등장 후 고구마 첫 등장까지 추가 딜레이
export const DEBUFF_RESPAWN_MIN = 18000 // ms
export const DEBUFF_RESPAWN_MAX = 30000 // ms

// === 아이템 (PvP — 빈도 상향) ===
export const PVP_KIBBLE_FIRST_DELAY = 1500 // ms
export const PVP_FISH_FIRST_DELAY = 2500 // ms
export const PVP_DEBUFF_FIRST_DELAY = 2500 // ms
export const PVP_DEBUFF_FIRST_STAGGER = 4000 // ms
export const PVP_ITEM_RESPAWN_MIN = 2500 // ms
export const PVP_ITEM_RESPAWN_MAX = 5000 // ms
export const PVP_DEBUFF_RESPAWN_MIN = 4000 // ms
export const PVP_DEBUFF_RESPAWN_MAX = 7000 // ms

// === 효과 지속시간 ===
export const BOOST_DURATION = 5000 // ms, 츄 부스트
export const BOOST_MUL = 1.55
export const MEGA_DURATION = 3000 // ms, 메가 부스트
export const MEGA_MUL = 2.0
export const SHIELD_DURATION = 5000 // ms, 실드
export const CUCUMBER_DURATION = 3000 // ms, 오이 픽업 시 고양이 가속 지속시간
export const SWEETPOTATO_DURATION = 3000 // ms, 고구마 픽업 시 슬로우 지속시간
export const SCORE_MULT_DURATION = 5000 // ms, 점수 ×2
export const SCORE_MULT = 2

// === 콤보 / 레벨 시스템 ===
export const COMBO_WINDOW = 1800 // ms, 다음 뽀뽀까지 콤보 유지 윈도우 (난이도 강화: 2400 → 1800)
export const LEVEL_UP_DURATION = 1800 // ms, LEVEL UP! 오버레이 표시 시간
export const LEVEL_THRESHOLDS = [
  0, 20, 50, 90, 140, 200, 270, 350, 440, 540, 650,
] as const
export const MAX_LEVEL = 10

// === PvP 게임 규칙 ===
export const PVP_TIME_LIMIT = 60000 // ms
export const PVP_KISS_GOAL = 10
export const DEBUFF_LEVEL_MIN = 3 // 솔로 디버프 활성화 레벨

// === 토스트 / 히스토리 ===
export const MAX_TOASTS = 3
export const TOAST_DURATION = 1800 // ms
export const HISTORY_MAX = 50

// === localStorage 키 ===
export const STORAGE_KEY_HISTORY = 'chuhuahua:history-v1'
export const STORAGE_KEY_PVP_HISTORY = 'chuhuahua:pvp-history-v1'
