// === 게임 영역 ===
export const GAME_WIDTH = 640 // px
export const GAME_HEIGHT = 480 // px
export const RENDER_FPS = 30 // React 렌더 주기 (RAF는 60fps)

// === 프레임률 독립 (dt 보정) ===
// 이동 로직은 60fps 기준으로 튜닝됨 — frameScale(dt)로 저fps에서 이동량을 보정해
// 슬로우모션을 막는다. 60fps면 dt비율 s≈1, 30fps면 s≈2.
export const PHYSICS_FRAME_MS = 1000 / 60 // 물리 기준 프레임(60fps) 길이
export const MAX_FRAME_SCALE = 2 // dt 폭주(탭 복귀 등) 시 이동량 상한 — 충돌 터널링 방지
// 게임 전반 속도 배율 — frameScale에 곱해져 모든 이동(캐릭터/비둘기, 솔로/PvP)에 일괄 적용.
// dt 보정으로 60fps 정규화되면서 (기존 고주사율 환경의 빠른 체감 대비) 굼떠진 것을 끌어올린다.
// 1.0 = 정확히 60fps 기준 속도. 직접 플레이하며 이 값 하나로 전체 속도감을 조정한다.
export const GAME_SPEED_MUL = 1.5
// 비둘기 전용 속도 배율 — 전반 배율(GAME_SPEED_MUL)과 분리. 1.0 = 비둘기는 60fps 기준 속도 유지.
// 츄/고양이는 빨라지되 비둘기는 따라 빨라지지 않게(난이도 과상승 방지) 별도로 둔다.
export const PIGEON_SPEED_MUL = 1.0

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
// 비둘기 회피 — 레벨↑ 시 트리거 거리 / 도망 거리 / 회피 lerp 배수 모두 증가.
// LV0: 220px / 90px / ×1.0 → LV10: 300px / 150px / ×1.5
export const CAT_FLEE_TRIGGER_BASE = 220 // px, 회피 반경 base
export const CAT_FLEE_TRIGGER_PER_LEVEL = 8 // px/level, 회피 반경 증가
export const CAT_FLEE_LOOKAHEAD_BASE = 90 // px, 회피 도망 거리 base
export const CAT_FLEE_LOOKAHEAD_PER_LEVEL = 6 // px/level, 도망 거리 증가
export const CAT_FLEE_LERP_BASE = 1.0 // 회피 시 lerp 배수 base (느려지지 않음)
export const CAT_FLEE_LERP_PER_LEVEL = 0.05 // 레벨당 회피 lerp 증가
export const CAT_DASH_THRESHOLD = 80 // px, 츄와 거리 이내면 대시 트리거
export const CAT_DASH_DIST = 130 // px, 대시 이동 거리
export const CAT_DASH_COOLDOWN = 1200 // ms

// === 비둘기 ===
export const PIGEON_SPEED_BASE = 1.6 // px/frame
export const PIGEON_SPEED_PER_LEVEL = 0.4 // 난이도 강화: 0.25 → 0.4 (LV10: 5.6)
// F-1.8: wave 시스템 도입 — 단일 스폰(PIGEON_SPAWN_*) 대신 spawnPigeonWave가 cadence 관리.
// 기존 단일 스폰 상수는 레퍼런스로만 보관 (다른 모듈에서 import 안 함).
export const PIGEON_SPAWN_MIN = 2500 // ms, [legacy] 단일 스폰 최소 간격
export const PIGEON_SPAWN_BASE = 13000 // ms, [legacy] LV0 기준 단일 스폰 간격
export const PIGEON_SPAWN_PER_LEVEL = 2000 // ms, [legacy] 레벨당 간격 단축량
// wave 시스템 cadence — reference line 1147~1149.
export const PIGEON_WAVE_BASE_DELAY = 13000 // ms, LV0 wave 사이 base 간격
export const PIGEON_WAVE_DELAY_PER_LEVEL = 1200 // ms, 레벨당 단축
export const PIGEON_WAVE_MIN_DELAY = 5000 // ms, 최소 wave 간격
export const PIGEON_WAVE_DELAY_JITTER = 1800 // ms, base에 더해지는 랜덤 jitter 상한
export const PIGEON_WAVE_MEMBER_SPACING = 600 // ms, 같은 wave 안 비둘기 간 간격
export const PIGEON_WAVE_MAX_SIZE = 10 // wave당 비둘기 상한 — waveSize = min(level, N)
export const PIGEON_HARD_CAP = 50 // 필드 비둘기 성능 안전망 (게임플레이 상한 아님, DOM/충돌검사 폭주 방지)
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
// reference 113~125 — solo와 별도 상수. 첫 등장은 빠르고 재스폰은 짧다.
export const PVP_KIBBLE_FIRST_DELAY = 1000 // ms
export const PVP_FISH_FIRST_DELAY = 2500 // ms
export const PVP_DEBUFF_FIRST_DELAY = 5000 // ms, cucumber 첫 등장
export const PVP_DEBUFF_FIRST_STAGGER = 4000 // ms, cucumber 후 sweetPotato 첫 등장 추가 딜레이
export const PVP_ITEM_RESPAWN_MIN = 2500 // ms, 일반(fish) 재스폰 하한
export const PVP_ITEM_RESPAWN_MAX = 5000 // ms, 일반(fish) 재스폰 상한
export const PVP_DEBUFF_RESPAWN_MIN = 4000 // ms, sweetPotato 재스폰 하한
export const PVP_DEBUFF_RESPAWN_MAX = 7000 // ms, sweetPotato 재스폰 상한
// 츄 유리 — kibble은 더 자주.
export const PVP_KIBBLE_RESPAWN_MIN = 1500 // ms
export const PVP_KIBBLE_RESPAWN_MAX = 3000 // ms
// 츄 불리 — cucumber는 덜 자주.
export const PVP_CUCUMBER_RESPAWN_MIN = 6500 // ms
export const PVP_CUCUMBER_RESPAWN_MAX = 10000 // ms

// === 효과 지속시간 ===
export const CHI_SAD_DURATION = 1500 // ms, PvP 쉴드 막힘 시 츄 sad 스프라이트 전환 지속
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
// wedding 게임변형 — 5압축 레벨 곡선 (LV0~LV5, 길이 6). 일반 곡선과 별개, wedding 모드일 때만.
export const WEDDING_LEVEL_THRESHOLDS = [0, 15, 35, 60, 90, 130] as const
export const WEDDING_MAX_LEVEL = 5

// 후반 난이도 압축 — LV이 FROM 초과 시 난이도 레버의 레벨 기울기를 SLOPE배로 완만하게.
// LV5까지는 기존 곡선 그대로, LV6+만 증가율을 줄여 후반 난도 급상승을 완화한다.
// (적용 레버: 비둘기 속도/wave 간격/wave 크기/냐 추격 lerp. progression/level.ts difficultyLevel)
export const DIFFICULTY_SOFTEN_FROM = 5
export const DIFFICULTY_SOFTEN_SLOPE = 0.5

// === PvP 게임 규칙 ===
export const PVP_TIME_LIMIT = 30000 // ms — 츄와와에게 주어진 시간
export const PVP_KISS_GOAL = 10
export const PVP_HISTORY_MAX = 50 // F-2 이후 PvP 히스토리 최대 보관 수 (정의만 — 사용 X)
export const DEBUFF_LEVEL_MIN = 3 // 솔로 디버프 활성화 레벨

// === 파티클 ===
export const MAX_PARTICLES = 40 // 동시 최대 — 초과 시 오래된 것부터 splice (in-place)

// === 토스트 / 히스토리 ===
export const MAX_TOASTS = 3
export const TOAST_DURATION = 1800 // ms
export const HISTORY_MAX = 50

// === localStorage 키 ===
export const STORAGE_KEY_HISTORY = 'chuhuahua:history-v1'
export const STORAGE_KEY_PVP_HISTORY = 'chuhuahua:pvp-history-v1'
