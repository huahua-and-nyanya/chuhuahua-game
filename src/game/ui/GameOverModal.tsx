import { useState } from 'react'

import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

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
const COLOR_PRIMARY = '#D4537E' // 진한 핑크 — GAME OVER 제목/다시하기 버튼
const COLOR_BUTTON_PINK = '#ED93B1' // 등록 버튼 (X 닫기 버튼과 동일 색)
const COLOR_PINK_SOFT = '#FBEAF0' // 등록 후 영역 배경
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

// CenterModal로 wrap → PixelCard 기본 헤더(분홍 바) + 외부 X 버튼 패턴 활용 (다른 모달과 일관성).
// title = "Top N 진입!" (rank 있을 때) / "GAME OVER" (그 외).
// body 안: shake 애니메이션 GAME OVER 큰 텍스트 + 부제 + 결과 + 닉네임 + 액션.
// 부모(라우트)가 게임오버 진입 시 mount, 다시하기/메인 시 unmount → useState 초기값 자동 reset.
export function GameOverModal(props: GameOverModalProps) {
  const { open, info, rank, defaultName, onSubmit, onRestart, onMain } = props
  const [nickname, setNickname] = useState(defaultName)
  const [registered, setRegistered] = useState(false)

  const canRegister = rank !== null
  const handleSubmit = () => {
    const trimmed = nickname.trim()
    if (!trimmed || registered) return
    onSubmit(trimmed)
    setRegistered(true)
  }

  const title = canRegister ? `Top ${rank} 진입!` : 'GAME OVER'

  return (
    <CenterModal
      open={open}
      onClose={onMain}
      title={title}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col">
        {/* GAME OVER 큰 텍스트 + 부제 — 등장 시 흔들림 */}
        <div
          className="mb-5.5 text-center"
          style={{ animation: 'gameover-shake 600ms ease-out' }}
        >
          <h2
            className="font-display text-3xl leading-none tracking-wider"
            style={{ color: COLOR_PRIMARY }}
          >
            GAME OVER
          </h2>
          <p className="font-body mt-3 text-xs" style={{ color: COLOR_LABEL }}>
            비둘기가 고양이를 잡았어요
          </p>
        </div>

        {/* 결과 — 위/아래 점선만 */}
        <div
          className="mb-5.5 flex flex-col px-1 py-4"
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

        {/* 닉네임 입력 / 등록 후 — rank가 있을 때만 */}
        {canRegister && (
          <div className="mb-5.5">
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
                  className="font-body h-10.5 flex-1 rounded-xl border-[1.5px] px-3.5 text-sm leading-relaxed"
                  style={{
                    borderColor: COLOR_INPUT_BORDER,
                    color: COLOR_VALUE,
                  }}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={nickname.trim().length === 0}
                  className="font-body h-10.5 rounded-xl px-5 text-sm font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: COLOR_BUTTON_PINK }}
                >
                  등록
                </button>
              </div>
            ) : (
              <div
                className="flex h-10.5 items-center gap-2.5 rounded-xl px-3.5"
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

        {/* 액션 — 메인으로(텍스트 + 영역 지정) + 다시하기(핑크 primary) */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onMain}
            className="font-body h-button-md inline-flex w-24 items-center justify-center text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: COLOR_TEXT_DARK }}
          >
            메인으로
          </button>
          <PixelButton
            variant="primary"
            size="lg"
            onClick={onRestart}
            className="max-w-55 flex-1"
          >
            다시하기
          </PixelButton>
        </div>
      </div>
    </CenterModal>
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
