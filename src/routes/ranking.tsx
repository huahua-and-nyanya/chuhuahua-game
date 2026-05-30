import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'

import { CHARACTER_ASSETS } from '@/assets'
import { useHistory } from '@/features/history/useHistory'
import type { SoloEntry } from '@/features/history/types'
import { usePvpHistory } from '@/features/pvp-history/usePvpHistory'
import type { PvpEntry } from '@/features/pvp-history/types'
import { QuitConfirmModal } from '@/game/ui/QuitConfirmModal'
import { PixelCard } from '@/ui/PixelCard'

import styles from './-styles/ranking.module.css'

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
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const solo = useHistory()
  const pvp = usePvpHistory()

  const entries = tab === 'solo' ? solo.entries : pvp.entries

  const soloSorted = useMemo(() => {
    if (soloSubTab === 'best') return solo.entries
    return [...solo.entries].sort((a, b) => b.date - a.date)
  }, [solo.entries, soloSubTab])

  const handleClearConfirm = () => {
    if (tab === 'solo') solo.clear()
    else pvp.clear()
    setConfirmClearOpen(false)
  }

  return (
    // 콘텐츠 라우트는 frameStack(align-items:center)의 flex 자식 — 폭 미지정 시 shrink-to-fit돼
    // 내부 테이블 min-w-max가 페이지를 뷰포트 밖으로 밀어낸다. w-full로 폭 고정 + overflow-x-hidden로
    // 페이지 레벨 가로 밀림 차단. 테이블 가로 스크롤은 안쪽 wrapper(자체 overflow-x-auto)가 담당.
    <div className="w-full min-w-0 overflow-x-hidden px-4 py-4">
      {/* 영수증 카드 — ROOT은 viewport-bound max-h, 내부 scroll wrapper에 dashed border 통합.
          콘텐츠가 dashed 박스 밖으로 절대 못 나감 */}
      <PixelCard
        padding="0"
        className="relative mx-auto max-h-[calc(100dvh-96px)] w-full max-w-[640px]"
      >
        {/* 4코너 분홍 도트 (ROOT 자식 — dashed border 안쪽 8px 위치) */}
        <CornerDots />

        {/* dashed 박스 = scroll wrapper. dashed border + rounded + overflow + max-h
            콘텐츠가 이 영역 밖으로 못 나감 */}
        <div
          className={clsx(
            styles.noScrollbar,
            'm-4 max-h-[calc(100dvh-128px)] min-w-0 overflow-y-auto rounded-xl border border-dashed border-pink-300',
          )}
        >
          {/* 본문 — py-5(20px) 휘게 명시 */}
          <div className="px-8 py-5 max-md:px-4 max-md:py-5">
            {/* 헤더 */}
            <div className="flex flex-col items-center gap-3 py-4">
              <h1 className="font-display text-text-accent mb-1 text-center text-xl leading-none tracking-[4px] md:text-[28px] lg:text-[32px]">
                플레이 기록
              </h1>
              <p className="text-text-muted text-center text-xs tracking-[4px]">
                ~ 뽀뽀 돌격 영수증 ~
              </p>
            </div>
            <Dashed />

            {/* 모드 탭 */}
            <div className="mb-4 flex w-full">
              <UnderlineTab
                active={tab === 'solo'}
                onClick={() => setTab('solo')}
              >
                혼자서
              </UnderlineTab>
              <UnderlineTab
                active={tab === 'pvp'}
                onClick={() => setTab('pvp')}
              >
                둘이서
              </UnderlineTab>
            </div>

            {/* 메타 박스 — 모바일 col stack */}
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

            {/* 물결 SVG */}
            <ZigzagDivider />

            {/* 푸터 */}
            <Footer
              mode={tab}
              soloEntries={solo.entries}
              pvpEntries={pvp.entries}
            />

            {/* 시리얼 */}
            <div className="mt-6 flex flex-col gap-2 py-6 text-center">
              <p className="text-text-primary text-xs tracking-[4px]">
                감사합니다 · 또 뽀뽀하러 와요
              </p>
              <p className="text-text-accent mt-1 text-[11px] font-bold tracking-[4px]">
                CHUHUAHUA-GAME-2026
              </p>
            </div>

            {/* 기록 초기화 버튼 */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="text-text-primary border-ink-base cursor-pointer rounded-full border-2 border-solid bg-transparent px-5 py-2 text-xs font-medium shadow-[2px_2px_0_var(--color-ink-base)] transition-[transform,box-shadow] duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                기록 초기화
              </button>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* 초기화 확인 모달 */}
      <QuitConfirmModal
        open={confirmClearOpen}
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={handleClearConfirm}
        title={
          tab === 'solo'
            ? '솔로 기록을 초기화할까요?'
            : 'PvP 기록을 초기화할까요?'
        }
        cancelLabel="취소"
        confirmLabel="초기화"
      >
        <p className="text-text-primary font-body py-4 text-sm">
          되돌릴 수 없어요
        </p>
      </QuitConfirmModal>
    </div>
  )
}

// ── 공용 ────────────────────────────────────────────────────────────

function CornerDots() {
  // dashed border가 inset-4 (16px)이므로 도트는 그 안쪽 8px = top-6 (24px)
  const base = 'absolute z-[2] h-2 w-2 bg-pink-700'
  return (
    <>
      <div className={clsx(base, 'top-6 left-6')} />
      <div className={clsx(base, 'top-6 right-6')} />
      <div className={clsx(base, 'bottom-6 left-6')} />
      <div className={clsx(base, 'right-6 bottom-6')} />
    </>
  )
}

function Dashed() {
  return <div className="border-ink-base my-4 border-t border-dashed" />
}

function ZigzagDivider() {
  return (
    <svg
      width="100%"
      height="12"
      viewBox="0 0 600 12"
      preserveAspectRatio="none"
      className="mt-4 mb-3 block"
    >
      <polyline
        points="0,12 12,4 24,12 36,4 48,12 60,4 72,12 84,4 96,12 108,4 120,12 132,4 144,12 156,4 168,12 180,4 192,12 204,4 216,12 228,4 240,12 252,4 264,12 276,4 288,12 300,4 312,12 324,4 336,12 348,4 360,12 372,4 384,12 396,4 408,12 420,4 432,12 444,4 456,12 468,4 480,12 492,4 504,12 516,4 528,12 540,4 552,12 564,4 576,12 588,4 600,12"
        fill="none"
        stroke="var(--color-ink-base)"
        strokeWidth="1.2"
      />
    </svg>
  )
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
        'lg:text-md flex-1 cursor-pointer border-b-2 px-4 py-2 text-center text-[12px] transition-[color,border-color,font-weight] duration-150',
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
  // 영수증 명세 행 — 라벨 ··· 점선 리더 ··· 값. 데스크톱/모바일 공용.
  const rows: { label: string; value: string }[] = [
    { label: '발행일자', value: today },
    { label: '플레이어', value: mode === 'solo' ? 'YOU' : 'P1 vs P2' },
    { label: '기록번호', value: `#${String(count).padStart(3, '0')}` },
    { label: '총 기록', value: String(count) },
  ]
  return (
    <div className="flex flex-col gap-4 py-3">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-end gap-2">
          <span className="text-text-muted shrink-0 text-xs tracking-[1px]">
            {label}
          </span>
          {/* 점선 리더 — flex-1로 채워 값 길이가 달라도 안 깨짐. mb-1로 텍스트 baseline에 맞춤. */}
          <span
            aria-hidden="true"
            className="border-ink-soft/40 mb-1 min-w-4 flex-1 border-b border-dotted"
          />
          <span className="text-text-primary shrink-0 text-sm font-bold tracking-[0.5px]">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── 솔로 ────────────────────────────────────────────────────────────

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
        // 모바일만 가로 스크롤. w-full + min-w-0으로 부모 chain의 width 강제 끊어
        // inner.min-w-max가 카드 폭을 늘리지 못하게 막음. 스크롤바는 noScrollbar로 숨김.
        <div
          className={clsx(
            styles.noScrollbar,
            'w-full min-w-0 max-md:overflow-x-auto',
          )}
        >
          <div className="max-md:min-w-max">
            <div
              className={clsx(
                styles.soloGrid,
                'text-text-primary border-ink-soft/50 border-b border-dashed px-2 py-2 text-[11px] leading-7 tracking-[1.5px]',
              )}
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
          </div>
        </div>
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
        'border-ink-base cursor-pointer rounded-full border-2 border-solid px-3 py-1 text-xs transition-[background,color,box-shadow,transform] duration-150',
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
        'relative px-2 py-2',
        isRecord &&
          'my-2 rounded border border-solid border-pink-700 bg-[#fff0e8]',
      )}
    >
      {isRecord && (
        <span className="text-text-on-pink absolute -top-2 -right-1 rounded bg-pink-700 px-2 py-1 text-[9px] font-bold tracking-[1px]">
          신기록
        </span>
      )}
      {/* row 자체에 leading-[32px] — 모든 자식 inherit, ascender/descender 잘림 방지 */}
      <div
        className={clsx(
          styles.soloGrid,
          'text-text-primary text-[13px] leading-[32px]',
        )}
      >
        <span className={clsx(isRecord && 'font-bold')}>#{rank}</span>
        <span
          className={clsx(
            'block min-w-0 text-[10px] text-ellipsis whitespace-nowrap',
            entry.name ? 'font-bold' : 'text-text-muted',
          )}
        >
          {entry.name || '—'}
        </span>
        <span
          className={clsx(
            'inline-flex items-baseline gap-1',
            isRecord ? 'text-text-accent text-md font-bold' : 'text-[14px]',
          )}
        >
          <span>💕</span>
          <span>{entry.score}</span>
        </span>
        <span className="text-center text-xs">×{entry.maxCombo}</span>
        <span className="text-center text-xs">{entry.maxLevel}</span>
        <span className="text-text-muted text-right text-[11px]">
          {formatDate(entry.date)}
        </span>
      </div>
    </div>
  )
}

// ── PvP ─────────────────────────────────────────────────────────────

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
    // 모바일만 가로 스크롤. w-full + min-w-0으로 부모 chain의 width 강제 끊어. 스크롤바 숨김.
    <div
      className={clsx(
        styles.noScrollbar,
        'w-full min-w-0 max-md:overflow-x-auto',
      )}
    >
      <div className="max-md:min-w-max">
        <div
          className={clsx(
            styles.pvpGrid,
            'text-text-primary border-ink-soft/50 border-b border-dashed px-2 py-2 text-[11px] leading-[28px] tracking-[1.5px]',
          )}
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
      </div>
    </div>
  )
}

function PvpRow({ entry, rank }: { entry: PvpEntry; rank: number }) {
  const isChi = entry.winner === 'chi'
  return (
    <div className="px-2 py-2">
      <div
        className={clsx(
          styles.pvpGrid,
          'text-text-primary text-[13px] leading-[32px]',
        )}
      >
        <span>#{rank}</span>
        <span
          className={clsx(
            'block min-w-0 text-[14px] text-ellipsis whitespace-nowrap',
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

      {mode === 'solo' ? (
        <SoloSummary entries={soloEntries} />
      ) : (
        <PvpSummary entries={pvpEntries} />
      )}
    </div>
  )
}

function SoloSummary({ entries }: { entries: SoloEntry[] }) {
  const best = entries.length > 0 ? Math.max(...entries.map((e) => e.score)) : 0
  const bestCombo =
    entries.length > 0 ? Math.max(...entries.map((e) => e.maxCombo)) : 0
  return (
    <div className="text-text-primary w-full max-w-[280px] px-1 text-[13px]">
      <SummaryRow label="총 플레이" value={String(entries.length)} bold />
      <SummaryRow label="최고 점수" value={`${best} ♡`} bold accent />
      <div className="border-ink-base mt-1 border-t border-solid pt-2 pb-1">
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
      <SummaryRow label="💋 츄와와 승" value={String(chiWins)} bold accent />
      <div className="border-ink-base mt-1 border-t border-solid pt-2 pb-1">
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
    <div className="flex justify-between py-2">
      <span>{label}</span>
      <span className={clsx(bold && 'font-bold', accent && 'text-text-accent')}>
        {value}
      </span>
    </div>
  )
}
