import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'

import { useHistory } from '@/features/history/useHistory'
import type { SoloEntry } from '@/features/history/types'
import { usePvpHistory } from '@/features/pvp-history/usePvpHistory'
import type { PvpEntry } from '@/features/pvp-history/types'
import { PixelButton } from '@/ui/PixelButton'

// 로컬 랭킹 페이지 — 솔로/PvP 탭 토글로 모드별 기록 표시.
// 데이터는 features 훅 경유 (CLAUDE.md 모듈 경계). 페이지 헤더는 __root.tsx가
// !isMain일 때 fixed 좌상단 "< 메인으로" Link 자동 노출 — 본 페이지 안에 헤더 X.
// (글로벌 Supabase 랭킹은 별도 /leaderboard 라우트 자리. 본 페이지는 로컬 기록 전용.)

export const Route = createFileRoute('/ranking')({
  component: RankingPage,
})

type Tab = 'solo' | 'pvp'

function formatDate(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function RankingPage() {
  const [tab, setTab] = useState<Tab>('solo')
  const solo = useHistory()
  const pvp = usePvpHistory()
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="p-md gap-sm flex shrink-0 justify-center">
        <PixelButton
          variant={tab === 'solo' ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setTab('solo')}
        >
          솔로
        </PixelButton>
        <PixelButton
          variant={tab === 'pvp' ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setTab('pvp')}
        >
          둘이서
        </PixelButton>
      </div>
      <div className="px-md pb-md flex-1 overflow-y-auto">
        {tab === 'solo' ? (
          <SoloList entries={solo.entries} />
        ) : (
          <PvpList entries={pvp.entries} />
        )}
      </div>
    </div>
  )
}

function SoloList({ entries }: { entries: SoloEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState text="아직 솔로 기록이 없어요" />
  }
  // SoloEntry는 score DESC 정렬 (features/history/storage.ts addEntry). i+1 = 실제 순위.
  return (
    <ul className="gap-sm flex flex-col py-2">
      {entries.map((e, i) => (
        <SoloRow key={e.id} entry={e} rank={i + 1} />
      ))}
    </ul>
  )
}

function SoloRow({ entry, rank }: { entry: SoloEntry; rank: number }) {
  return (
    <li className="bg-bg-card shadow-card gap-sm p-sm flex items-center rounded-md border-2 border-dashed border-pink-300">
      <div className="text-text-accent font-display w-8 shrink-0 text-center text-lg leading-none">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-text-primary font-body truncate text-sm leading-none">
          {entry.name || '익명'}
        </div>
        <div className="text-text-muted mt-1 truncate text-xs leading-none">
          LV {entry.maxLevel} · ×{entry.maxCombo} ·{' '}
          {formatElapsed(entry.elapsedMs)} · {formatDate(entry.date)}
        </div>
      </div>
      <div className="text-text-primary font-display shrink-0 text-lg leading-none">
        {entry.score.toLocaleString()}
      </div>
    </li>
  )
}

function PvpList({ entries }: { entries: PvpEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState text="아직 PvP 기록이 없어요" />
  }
  // PvpEntry는 date DESC 정렬 (features/pvp-history/storage.ts addPvpEntry, unshift).
  return (
    <ul className="gap-sm flex flex-col py-2">
      {entries.map((e, i) => (
        <PvpRow key={e.id} entry={e} rank={i + 1} />
      ))}
    </ul>
  )
}

function PvpRow({ entry, rank }: { entry: PvpEntry; rank: number }) {
  const isChi = entry.winner === 'chi'
  return (
    <li className="bg-bg-card shadow-card gap-sm p-sm flex items-center rounded-md border-2 border-dashed border-pink-300">
      <div className="text-text-accent font-display w-8 shrink-0 text-center text-lg leading-none">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={clsx(
            'font-body truncate text-sm leading-none',
            isChi ? 'text-text-accent' : 'text-text-primary',
          )}
        >
          {isChi ? '츄와와 승 🐶' : '고양이 승 😼'}
        </div>
        <div className="text-text-muted mt-1 truncate text-xs leading-none">
          💋 {entry.kissCount} · {formatElapsed(entry.elapsed)} ·{' '}
          {formatDate(entry.date)}
        </div>
      </div>
    </li>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-text-muted font-body py-xl text-center text-sm">
      {text}
    </div>
  )
}
