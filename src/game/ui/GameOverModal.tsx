import { useEffect, useState } from 'react'

export type GameOverCause = 'pigeon-hit'

export type GameOverInfo = {
  finalScore: number
  maxLevel: number
  maxCombo: number
  elapsedMs: number
  cause: GameOverCause
}

export type GameOverModalProps = {
  open: boolean
  info: GameOverInfo
  // 1~RANK_TOP_N이면 number, 등재 권 밖이면 null — 닉네임 입력 영역 자체를 숨김.
  rank: number | null
  defaultName: string
  onSubmit: (name: string) => void
  onRestart: () => void
  onMain: () => void
}

const NICKNAME_MAX = 12

// 시안 확정 헥스값. 기존 tokens.css와 매칭되지 않아 인라인 사용.
// (escalation 1: 추후 시각 시스템 정리 사이클에서 새 토큰으로 추출 권장)
const COLOR_PRIMARY = '#D4537E' // 진한 핑크 — 제목/다시하기 버튼/등록 버튼
const COLOR_CLOSE = '#ED93B1' // X 닫기 버튼 배경
const COLOR_PINK_SOFT = '#FBEAF0' // 등록 후 영역 배경, Top 칩 배경
const COLOR_DASH = '#F4C0D1' // 결과 영역 위/아래 점선
const COLOR_LABEL = '#888780' // 회색 라벨 / 부제
const COLOR_TEXT_DARK = '#5F5E5A' // 메인으로 텍스트
const COLOR_VALUE = '#2C2C2A' // 결과 값 / 닉네임 텍스트
const COLOR_INPUT_BORDER = '#D3D1C7' // input border

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// 자체 backdrop + card. 부모(라우트)가 게임오버 진입 시 mount, 다시하기/메인 클릭 시 unmount.
// nickname/registered는 useState 초기값에 의존 — mount/unmount 자연 reset.
// body overflow 잠금 + Escape → onMain은 CenterModal 패턴 인라인.
export function GameOverModal(props: GameOverModalProps) {
  const { open, info, rank, defaultName, onSubmit, onRestart, onMain } = props
  const [nickname, setNickname] = useState(defaultName)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMain()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onMain])

  if (!open) return null

  const canRegister = rank !== null
  const handleSubmit = () => {
    const trimmed = nickname.trim()
    if (!trimmed || registered) return
    onSubmit(trimmed)
    setRegistered(true)
  }

  return (
    <div
      className="bg-bg-modal-backdrop p-lg animate-backdrop-in fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onMain}
      role="presentation"
    >
      <div
        className="border-ink-base animate-card-in relative w-full max-w-[460px] rounded-2xl border-2 bg-white px-7 pt-7 pb-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="게임오버"
      >
        {/* 헤더 row — 좌측 Top N 칩 (rank가 있을 때만) + 우측 X 닫기 */}
        <div className="mb-5 flex items-center justify-between">
          {canRegister ? (
            <span
              className="font-body inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: COLOR_PINK_SOFT, color: COLOR_PRIMARY }}
            >
              Top {rank} 진입!
            </span>
          ) : (
            <span aria-hidden />
          )}
          <button
            type="button"
            onClick={onMain}
            aria-label="닫기"
            className="border-ink-base inline-flex h-8 w-8 items-center justify-center rounded-full border-2 leading-none font-bold text-white"
            style={{ background: COLOR_CLOSE }}
          >
            ×
          </button>
        </div>

        {/* 제목 + 부제 */}
        <div className="mb-[22px] text-center">
          <h2
            className="font-display text-3xl leading-none tracking-wider"
            style={{ color: COLOR_PRIMARY }}
          >
            GAME OVER
          </h2>
          <p
            className="font-body mt-1.5 text-xs"
            style={{ color: COLOR_LABEL }}
          >
            비둘기가 고양이를 잡았어요
          </p>
        </div>

        {/* 결과 — 위/아래 점선만, 카드 없음 */}
        <div
          className="mb-[22px] flex flex-col px-1 py-4"
          style={{
            borderTop: `1px dashed ${COLOR_DASH}`,
            borderBottom: `1px dashed ${COLOR_DASH}`,
          }}
        >
          <ResultRow label="점수" value={info.finalScore.toString()} />
          <ResultRow label="최고 레벨" value={`LV ${info.maxLevel}`} />
          <ResultRow label="최대 콤보" value={`×${info.maxCombo}`} />
          <ResultRow label="플레이 시간" value={formatTime(info.elapsedMs)} />
        </div>

        {/* 닉네임 입력 / 등록 후 표시 — rank가 있을 때만 */}
        {canRegister && (
          <div className="mb-[22px]">
            <label
              className="font-body mb-2 block pl-1 text-xs font-medium"
              style={{ color: COLOR_LABEL }}
            >
              랭킹 등록 닉네임
            </label>
            {!registered ? (
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  maxLength={NICKNAME_MAX}
                  placeholder={`닉네임 (최대 ${NICKNAME_MAX}자)`}
                  autoFocus
                  className="font-body h-[42px] flex-1 rounded-xl border-[1.5px] px-3.5 text-sm"
                  style={{
                    borderColor: COLOR_INPUT_BORDER,
                    color: COLOR_VALUE,
                  }}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={nickname.trim().length === 0}
                  className="border-ink-base font-body h-[42px] rounded-xl border-2 px-5 text-sm font-medium whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: COLOR_PRIMARY }}
                >
                  등록
                </button>
              </div>
            ) : (
              <div
                className="flex h-[42px] items-center gap-2.5 rounded-xl px-3.5"
                style={{ background: COLOR_PINK_SOFT }}
              >
                <span
                  className="font-body flex-1 text-sm font-medium"
                  style={{ color: COLOR_VALUE }}
                >
                  {nickname.trim()}
                </span>
                <span
                  className="font-body inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium"
                  style={{ color: COLOR_PRIMARY }}
                >
                  <span aria-hidden>✓</span>
                  <span>등록 완료</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* 액션 — 메인으로(텍스트만) + 다시하기(primary 핑크) */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onMain}
            className="font-body px-1 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: COLOR_TEXT_DARK }}
          >
            메인으로
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="border-ink-base font-body h-12 max-w-[220px] flex-1 rounded-xl border-2 text-base font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: COLOR_PRIMARY }}
          >
            다시하기
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-body text-sm" style={{ color: COLOR_LABEL }}>
        {label}
      </span>
      <span
        className="font-body text-base font-medium"
        style={{ color: COLOR_VALUE }}
      >
        {value}
      </span>
    </div>
  )
}
