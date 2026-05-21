import { useState } from 'react'

import { CenterModal } from '@/ui/CenterModal'
import { PixelButton } from '@/ui/PixelButton'
import { PixelChip } from '@/ui/PixelChip'

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

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// 부모(라우트)가 게임오버 진입 시 mount, 다시하기/메인 클릭 시 unmount 하는 패턴.
// 따라서 props.defaultName은 mount 시점에만 의미가 있고 라이프타임 중 변경되지 않는다.
export function GameOverModal(props: GameOverModalProps) {
  const { open, info, rank, defaultName, onSubmit, onRestart, onMain } = props
  const [name, setName] = useState(defaultName)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    onSubmit(trimmed)
    setSubmitted(true)
  }

  const title = rank !== null ? `Top ${rank} 진입!` : 'GAME OVER'
  const canRegister = rank !== null && !submitted

  return (
    <CenterModal
      open={open}
      onClose={onMain}
      title={title}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="gap-md flex flex-col">
        <div className="gap-sm grid grid-cols-2">
          <Stat label="점수" value={info.finalScore} />
          <Stat label="최고 LV" value={info.maxLevel} />
          <Stat label="최대 콤보" value={info.maxCombo} />
          <Stat label="플레이 시간" value={formatTime(info.elapsedMs)} />
        </div>

        {canRegister && (
          <div className="gap-xs flex flex-col">
            <label className="text-text-muted text-sm">닉네임</label>
            <div className="gap-xs flex">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                maxLength={NICKNAME_MAX}
                placeholder="익명"
                autoFocus
                className="border-ink-base font-body flex-1 rounded-md border-2 px-2 py-1 text-sm"
              />
              <PixelButton
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={name.trim().length === 0}
              >
                등록
              </PixelButton>
            </div>
          </div>
        )}

        {submitted && (
          <div className="flex justify-center">
            <PixelChip>등록 완료</PixelChip>
          </div>
        )}

        <div className="gap-sm flex">
          <PixelButton variant="secondary" onClick={onMain} className="flex-1">
            메인으로
          </PixelButton>
          <PixelButton variant="primary" onClick={onRestart} className="flex-1">
            다시하기
          </PixelButton>
        </div>
      </div>
    </CenterModal>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-bg-card flex flex-col items-center gap-0.5 rounded-md border-2 border-pink-300 px-2 py-1.5">
      <span className="text-text-muted text-xs">{label}</span>
      <span className="font-display text-text-primary text-lg leading-none">
        {value}
      </span>
    </div>
  )
}
