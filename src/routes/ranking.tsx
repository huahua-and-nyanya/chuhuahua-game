import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'

import { CHARACTER_ASSETS } from '@/assets'
import { useHistory } from '@/features/history/useHistory'
import type { SoloEntry } from '@/features/history/types'
import { usePvpHistory } from '@/features/pvp-history/usePvpHistory'
import type { PvpEntry } from '@/features/pvp-history/types'

// 로컬 랭킹 페이지 — GameFrameCard 탈출, 자체 자유 레이아웃.
// __root.tsx isContentRoute 분기로 GameFrameCard wrapper 없이 <Outlet /> 직접 렌더.
// 영수증 디자인. 모든 padding/gap/margin은 4px 그리드 강제.

export const Route = createFileRoute('/ranking')({
  component: RankingPage,
})

type Tab = 'solo' | 'pvp'
type SoloSubTab = 'best' | 'recent'

function formatDate(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function RankingPage() {
  const [tab, setTab] = useState<Tab>('solo')
  const [soloSubTab, setSoloSubTab] = useState<SoloSubTab>('best')
  const solo = useHistory()
  const pvp = usePvpHistory()

  const entries = tab === 'solo' ? solo.entries : pvp.entries

  const soloSorted = useMemo(() => {
    if (soloSubTab === 'best') return solo.entries
    return [...solo.entries].sort((a, b) => b.date - a.date)
  }, [solo.entries, soloSubTab])

  return (
    <div className="mx-auto w-full max-w-[640px] bg-bg-card px-8 pt-8 pb-6 shadow-card">
      {/* 헤더 */}
      <h1 className="font-display text-text-accent mb-4 text-center text-[32px] leading-none tracking-[4px]">
        플레이 기록
      </h1>

      <Dashed />

      {/* 모드 탭 (underline) */}
      <div className="mb-4 flex justify-center gap-6">
        <UnderlineTab active={tab === 'solo'} onClick={() => setTab('solo')}>
          혼자서
        </UnderlineTab>
        <UnderlineTab active={tab === 'pvp'} onClick={() => setTab('pvp')}>
          둘이서
        </UnderlineTab>
      </div>

      {/* 메타 박스 */}
      <MetaBox mode={tab} count={entries.length} />

      <Dashed />

      {/* 콘텐츠 */}
      {tab === 'solo' ? (
        <SoloSection
          entries={soloSorted}
          subTab={soloSubTab}
          onSubTab={setSoloSubTab}
        />
      ) : (
        <PvpSection entries={pvp.entries} />
      )}

      {/* 푸터 */}
      <Footer
        mode={tab}
        soloEntries={solo.entries}
        pvpEntries={pvp.entries}
      />
    </div>
  )
}

// ── 공용 ────────────────────────────────────────────────────────────

function Dashed() {
  return <div className="my-4 border-t border-dashed border-ink-base" />
}

function UnderlineTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'cursor-pointer border-b-2 px-4 py-2 text-[16px] transition-[color,border-color,font-weight] duration-150',
        active
          ? 'text-text-primary border-ink-base font-bold'
          : 'text-text-muted border-transparent font-normal',
      )}
    >
      {children}
    </button>
  )
}

function MetaBox({ mode, count }: { mode: Tab; count: number }) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
  return (
    <div className="text-text-primary grid grid-cols-2 gap-x-5 gap-y-1 py-2 text-xs leading-relaxed">
      <span>발행일자 : {today}</span>
      <span>플레이어 : {mode === 'solo' ? 'YOU' : 'P1 vs P2'}</span>
      <span>기록번호 : #{String(count).padStart(3, '0')}</span>
      <span>총 기록 : {count}</span>
    </div>
  )
}

// ── 솔로 ────────────────────────────────────────────────────────────

const SOLO_COLS = '36px 72px 1fr 52px 44px 76px'

function SoloSection({
  entries,
  subTab,
  onSubTab,
}: {
  entries: SoloEntry[]
  subTab: SoloSubTab
  onSubTab: (t: SoloSubTab) => void
}) {
  return (
    <>
      <div className="mb-3 flex justify-end gap-2">
        <StampButton
          active={subTab === 'best'}
          onClick={() => onSubTab('best')}
        >
          최고 점수
        </StampButton>
        <StampButton
          active={subTab === 'recent'}
          onClick={() => onSubTab('recent')}
        >
          최근 경기
        </StampButton>
      </div>

      {entries.length === 0 ? (
        <EmptyState>
          아직 기록이 없어요!
          <br />
          <span className="opacity-70">게임 탭에서 한판 도전해보세요 💪</span>
        </EmptyState>
      ) : (
        <>
          <div
            className="text-text-primary grid items-center border-b border-dashed border-ink-soft/50 px-2 py-2 text-[11px] tracking-[1.5px]"
            style={{ gridTemplateColumns: SOLO_COLS }}
          >
            <span>순위</span>
            <span>이름</span>
            <span>점수</span>
            <span className="text-center">콤보</span>
            <span className="text-center">레벨</span>
            <span className="text-right">날짜</span>
          </div>
          {entries.map((e, i) => (
            <SoloRow
              key={e.id}
              entry={e}
              rank={i + 1}
              isRecord={subTab === 'best' && i === 0}
            />
          ))}
        </>
      )}
    </>
  )
}

function StampButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'cursor-pointer rounded-full border-2 border-solid border-ink-base px-3 py-1 text-xs transition-[background,color,box-shadow,transform] duration-150',
        active
          ? 'bg-ink-base text-text-on-pink translate-x-0.5 translate-y-0.5 shadow-none'
          : 'bg-bg-card text-text-primary shadow-[2px_2px_0_var(--color-ink-base)]',
      )}
    >
      {children}
    </button>
  )
}

function SoloRow({
  entry,
  rank,
  isRecord,
}: {
  entry: SoloEntry
  rank: number
  isRecord: boolean
}) {
  return (
    <div
      className={clsx(
        'text-text-primary relative grid items-center px-2 py-2 text-[13px]',
        isRecord && 'my-2 rounded border border-solid border-pink-700 bg-[#fff0e8]',
      )}
      style={{ gridTemplateColumns: SOLO_COLS }}
    >
      {isRecord && (
        <span className="bg-pink-700 text-text-on-pink absolute -top-2 -right-1 rounded px-2 py-1 text-[9px] font-bold tracking-[1px]">
          신기록
        </span>
      )}
      <span className={clsx(isRecord && 'font-bold')}>#{rank}</span>
      <span
        className={clsx(
          'truncate text-[11px]',
          entry.name ? 'font-bold' : 'text-text-muted',
        )}
      >
        {entry.name || '—'}
      </span>
      <span
        className={clsx(
          isRecord
            ? 'text-text-accent text-[16px] font-bold'
            : 'text-[14px]',
        )}
      >
        💕 {entry.score}
      </span>
      <span className="text-center text-xs">×{entry.maxCombo}</span>
      <span className="text-center text-xs">{entry.maxLevel}</span>
      <span className="text-text-muted text-right text-[11px]">
        {formatDate(entry.date)}
      </span>
    </div>
  )
}

// ── PvP ─────────────────────────────────────────────────────────────

const PVP_COLS = '36px 1fr 60px 76px 76px'

function PvpSection({ entries }: { entries: PvpEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState>
        아직 PvP 기록이 없어요!
        <br />
        <span className="opacity-70">둘이서 한판 도전해보세요 ⚔️</span>
      </EmptyState>
    )
  }
  return (
    <>
      <div
        className="text-text-primary grid items-center border-b border-dashed border-ink-soft/50 px-2 py-2 text-[11px] tracking-[1.5px]"
        style={{ gridTemplateColumns: PVP_COLS }}
      >
        <span>순위</span>
        <span>승자</span>
        <span className="text-center">뽀뽀</span>
        <span className="text-center">시간</span>
        <span className="text-right">날짜</span>
      </div>
      {entries.map((e, i) => (
        <PvpRow key={e.id} entry={e} rank={i + 1} />
      ))}
    </>
  )
}

function PvpRow({ entry, rank }: { entry: PvpEntry; rank: number }) {
  const isChi = entry.winner === 'chi'
  return (
    <div
      className="text-text-primary grid items-center px-2 py-2 text-[13px]"
      style={{ gridTemplateColumns: PVP_COLS }}
    >
      <span>#{rank}</span>
      <span
        className={clsx(
          'truncate text-sm',
          isChi ? 'text-text-accent' : 'text-text-primary',
        )}
      >
        {isChi ? '츄와와 승 🐶' : '고양이 승 😼'}
      </span>
      <span className="text-center text-sm">💋 {entry.kissCount}</span>
      <span className="text-center text-xs">
        {(entry.elapsed / 1000).toFixed(1)}초
      </span>
      <span className="text-text-muted text-right text-[11px]">
        {formatDate(entry.date)}
      </span>
    </div>
  )
}

// ── 공용 ────────────────────────────────────────────────────────────

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-text-muted font-body py-10 text-center text-sm">
      {children}
    </div>
  )
}

// ── 푸터 ────────────────────────────────────────────────────────────

function Footer({
  mode,
  soloEntries,
  pvpEntries,
}: {
  mode: Tab
  soloEntries: SoloEntry[]
  pvpEntries: PvpEntry[]
}) {
  return (
    <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
      {/* 좌 — 일러스트 + 부제 */}
      <div className="flex flex-col items-center gap-2 md:items-start">
        <div className="flex h-[120px] shrink-0 items-center justify-center">
          <img
            src={CHARACTER_ASSETS.chihuahuaReceipt}
            alt="츄와와가 영수증을 발행했어요"
            className="h-full w-auto shrink-0 object-contain"
          />
        </div>
        <span className="text-text-muted px-1 text-[11px] tracking-[1px]">
          ~ 츄와와가 영수증을 발행했어요 ~
        </span>
      </div>

      {/* 우 — 합계 */}
      {mode === 'solo' ? (
        <SoloSummary entries={soloEntries} />
      ) : (
        <PvpSummary entries={pvpEntries} />
      )}
    </div>
  )
}

function SoloSummary({ entries }: { entries: SoloEntry[] }) {
  const best =
    entries.length > 0 ? Math.max(...entries.map((e) => e.score)) : 0
  const bestCombo =
    entries.length > 0 ? Math.max(...entries.map((e) => e.maxCombo)) : 0
  return (
    <div className="text-text-primary w-full max-w-[280px] px-1 text-[13px]">
      <SummaryRow label="총 플레이" value={String(entries.length)} bold />
      <SummaryRow label="최고 점수" value={`${best} ♡`} bold accent />
      <div className="mt-1 border-t border-solid border-ink-base px-0 pt-2 pb-1">
        <SummaryRow label="최고 콤보" value={`×${bestCombo}`} bold />
      </div>
    </div>
  )
}

function PvpSummary({ entries }: { entries: PvpEntry[] }) {
  const chiWins = entries.filter((e) => e.winner === 'chi').length
  const catWins = entries.filter((e) => e.winner === 'cat').length
  return (
    <div className="text-text-primary w-full max-w-[280px] px-1 text-[13px]">
      <SummaryRow label="총 플레이" value={String(entries.length)} bold />
      <SummaryRow
        label="💋 츄와와 승"
        value={String(chiWins)}
        bold
        accent
      />
      <div className="mt-1 border-t border-solid border-ink-base px-0 pt-2 pb-1">
        <SummaryRow label="🐱 고양이 승" value={String(catWins)} bold />
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string
  value: string
  bold?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex justify-between py-1">
      <span>{label}</span>
      <span className={clsx(bold && 'font-bold', accent && 'text-text-accent')}>
        {value}
      </span>
    </div>
  )
}
