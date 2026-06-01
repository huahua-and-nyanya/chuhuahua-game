import { useState } from 'react'

import { COIN_ICON_PATH } from '@/assets/clothes'
import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'

export type GameOverCause = 'pigeon-hit' | 'quit'

export type GameOverInfo = {
  finalScore: number
  maxLevel: number
  maxCombo: number
  elapsedMs: number
  cause: GameOverCause
  earnedCoins: number // 이번 판 획득 코인
  walletFull: boolean // 지갑(999) 가득 — true면 코인 수 대신 "지갑이 다 찼어" 표시
}

export type GameOverModalProps = {
  open: boolean
  info: GameOverInfo
  // 1~RANK_TOP_N이면 number, 등재 권 밖이면 null — 닉네임 입력 영역 자체를 숨김.
  rank: number | null
  defaultName: string
  onSubmit: (name: string) => void
  // 'gameover'(기본): GAME OVER + 다시하기. 'story': 컷신 성공 결과(다시하기 없음).
  variant?: 'gameover' | 'story'
  // story variant 문구 오버라이드 — 미지정이면 propose 엔딩 기본 문구. wedding 엔딩이 전달.
  storyTitle?: string // 카드 헤더
  storyHeading?: string // 큰 텍스트
  storySubtitle?: string // 부제
  onRestart?: () => void // story variant에선 미사용
  onMain: () => void
}

const NICKNAME_MAX = 12

// 시안 확정 헥스값. 기존 tokens.css와 매칭되지 않아 인라인 사용.
const COLOR_PRIMARY = '#D4537E' // 진한 핑크 — GAME OVER 제목/다시하기 버튼
const COLOR_PINK_SOFT = '#FBEAF0' // 등록 후 영역 배경
const COLOR_DASH = '#F4C0D1' // 결과 영역 위/아래 점선
const COLOR_LABEL = '#888780' // 회색 라벨 / 부제
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
// nickname 초기값은 항상 빈 값. defaultName(이전 입력 캐시)은 placeholder로만 노출.
export function GameOverModal(props: GameOverModalProps) {
  const {
    open,
    info,
    rank,
    defaultName,
    onSubmit,
    onRestart,
    onMain,
    variant = 'gameover',
    storyTitle,
    storyHeading,
    storySubtitle,
  } = props
  const [nickname, setNickname] = useState('')
  const [registered, setRegistered] = useState(false)

  const isStory = variant === 'story'
  const canRegister = rank !== null
  const handleSubmit = () => {
    const trimmed = nickname.trim()
    if (!trimmed || registered) return
    onSubmit(trimmed)
    setRegistered(true)
  }

  // story: 성공 결과 — 헤더는 짧은 축하 문구. gameover: 랭크 진입/기본.
  const title = isStory
    ? (storyTitle ?? '프로포즈 성공!')
    : canRegister
      ? `Top ${rank} 진입!`
      : 'GAME OVER'

  return (
    <CenterModal
      open={open}
      onClose={onMain}
      title={title}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col">
        {/* 큰 텍스트 + 부제 — 등장 시 흔들림. story는 성공 문구, 그 외 GAME OVER. */}
        <div className="animate-gameover-shake mb-5.5 text-center">
          <h2
            className={
              isStory
                ? 'font-display text-2xl leading-tight tracking-wide'
                : 'font-display text-3xl leading-none tracking-wider'
            }
            style={{ color: COLOR_PRIMARY }}
          >
            {isStory ? (storyHeading ?? '프로포즈를 성공했어!') : 'GAME OVER'}
          </h2>
          <p className="font-body mt-3 text-xs" style={{ color: COLOR_LABEL }}>
            {isStory
              ? (storySubtitle ?? '이제 뽑기에서 웨딩룩을 만날 수 있어!')
              : info.cause === 'quit'
                ? '그만뒀어요'
                : '비둘기가 고양이를 잡았어요'}
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

        {/* 코인 — 이번 판 획득(+N). 지갑(999) 가득이면 수 대신 "지갑이 다 찼어". */}
        <div className="mb-5.5 flex items-center justify-between px-1 py-1">
          <span className="font-body text-sm" style={{ color: COLOR_LABEL }}>
            획득 코인
          </span>
          {info.walletFull ? (
            <span
              className="font-body text-sm font-bold"
              style={{ color: 'var(--color-danger)' }}
            >
              지갑이 다 찼어
            </span>
          ) : (
            <span
              className="font-body inline-flex items-center gap-1 text-base font-bold"
              style={{ color: 'var(--color-game-warn)' }}
            >
              <img
                src={COIN_ICON_PATH}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 object-contain"
              />
              +{info.earnedCoins}
            </span>
          )}
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
                  placeholder={
                    defaultName
                      ? `${defaultName} (이전 닉네임)`
                      : `닉네임 (최대 ${NICKNAME_MAX}자)`
                  }
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
                  className="font-body bg-button-primary-bg text-button-primary-text h-10.5 rounded-xl px-5 text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="font-body inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-2 text-xs font-medium"
                  style={{ color: COLOR_PRIMARY }}
                >
                  <span aria-hidden>✓</span>
                  <span>등록 완료</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* 액션 — story는 [메인으로]만. gameover는 메인으로 + 다시하기. */}
        {isStory ? (
          <div className="flex w-full justify-center">
            <PixelButton
              className="w-full"
              variant="primary"
              size="lg"
              onClick={onMain}
            >
              메인으로
            </PixelButton>
          </div>
        ) : (
          <div className="gap-sm flex w-full justify-center">
            <PixelButton variant="secondary" size="lg" onClick={onMain}>
              메인으로
            </PixelButton>
            <PixelButton
              className="w-full"
              variant="primary"
              size="lg"
              onClick={onRestart}
            >
              다시하기
            </PixelButton>
          </div>
        )}
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
