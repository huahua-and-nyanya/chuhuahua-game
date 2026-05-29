import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'

import { CHARACTER_ASSETS } from '@/assets'
import {
  CAPSULE_ICON_PATH,
  FITTING_ROOM_BG_PATH,
  clothPath,
} from '@/assets/clothes'
import type {
  ClothEffects,
  ClothEntry,
  GachaResult,
} from '@/features/wardrobe/types'
import { CLOTHES } from '@/features/wardrobe/clothes'
import { GRADE_TOKENS } from '@/features/wardrobe/grades'
import { useWardrobe } from '@/features/wardrobe/useWardrobe'
import { CenterModal } from '@/ui/CenterModal'
import { CoinChip } from '@/ui/CoinChip'
import { GridCard } from '@/ui/GridCard'
import { IconCostButton } from '@/ui/IconCostButton'
import { PixelButton } from '@/ui/PixelButton'
import { PixelCard } from '@/ui/PixelCard'

export const Route = createFileRoute('/wardrobe')({
  component: WardrobePage,
})

// 가챠 1회 표시 비용. 실제 추첨 연결은 W-3.
const GACHA_COST = 100

const ALL_CLOTHES = Object.values(CLOTHES)

type CatalogFilter = 'all' | 'B' | 'A' | 'S'

const CATALOG_FILTERS: { key: CatalogFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'B', label: 'B' },
  { key: 'A', label: 'A' },
  { key: 'S', label: 'S' },
]

// 효과를 한국어 문구로 변환.
function effectLabel(effects: ClothEffects): string[] {
  const lines: string[] = []
  if (effects.chiSpeedMul)
    lines.push(`속도 +${Math.round((effects.chiSpeedMul - 1) * 100)}%`)
  if (effects.catSpeedMul)
    lines.push(`냐냐 느리게 ${Math.round((1 - effects.catSpeedMul) * 100)}%`)
  if (effects.pigeonSpawnMul)
    lines.push(
      `비둘기 ${Math.round((effects.pigeonSpawnMul - 1) * 100)}% 덜 나타남`,
    )
  if (effects.itemSpawnMul)
    lines.push(
      `아이템 ${Math.round((1 - effects.itemSpawnMul) * 100)}% 더 자주`,
    )
  return lines
}

// 자산 파일이 아직 없을 수 있어 onError 폴백 처리 (W-7 전).
function FallbackImage({
  src,
  fallbackSrc,
  alt,
  className,
}: {
  src: string
  fallbackSrc: string
  alt: string
  className?: string
}) {
  const [errored, setErrored] = useState(false)
  return (
    <img
      src={errored ? fallbackSrc : src}
      alt={alt}
      draggable={false}
      onError={() => setErrored(true)}
      className={className}
    />
  )
}

function WardrobePage() {
  const { coins, pity, owned, equipped, toggleEquip, pullGacha } = useWardrobe()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('all')
  const [catalogDetail, setCatalogDetail] = useState<
    ClothEntry | 'locked' | null
  >(null)

  const handleGacha = () => {
    setGachaResult(pullGacha())
  }

  const ownedClothes = ALL_CLOTHES.filter((c) => owned.includes(c.id))
  const selected = selectedId ? CLOTHES[selectedId] : null
  const selectedOwned = selectedId ? owned.includes(selectedId) : false

  const handleClothClick = (cloth: ClothEntry) => {
    if (!owned.includes(cloth.id)) {
      setSelectedId(cloth.id) // 미보유 → ??? 팝업
      return
    }
    if (equipped === cloth.id) {
      setSelectedId(cloth.id) // 장착 중 → 상세 팝업
      return
    }
    toggleEquip(cloth.id) // 보유 미장착 → 즉시 장착
  }

  const unequip = () => {
    if (equipped) toggleEquip(equipped)
  }

  const fittingSrc = equipped
    ? clothPath('chi', equipped, 'full')
    : CHARACTER_ASSETS.chihuahua

  return (
    <div className="px-4 py-4">
      <PixelCard
        padding="0"
        className="relative mx-auto flex max-h-[calc(100dvh-96px)] w-full max-w-[560px] flex-col"
      >
        {/* 헤더 */}
        <header className="border-border-card relative flex shrink-0 items-center justify-center border-b-2 border-dashed bg-pink-300 px-4 py-3">
          <h1 className="font-display text-ink-base text-lg tracking-[0.04em]">
            옷장
          </h1>
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <CoinChip amount={coins} size="sm" />
          </div>
        </header>

        {/* 피팅룸 */}
        <div
          className="flex h-[170px] shrink-0 items-center justify-center"
          style={{
            backgroundColor: 'var(--color-bg-frame)',
            backgroundImage: `url(${FITTING_ROOM_BG_PATH})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <FallbackImage
            key={equipped ?? 'none'}
            src={fittingSrc}
            fallbackSrc={CHARACTER_ASSETS.chihuahua}
            alt="피팅룸 츄와와"
            className="h-[130px] w-[130px] object-contain"
          />
        </div>

        {/* 그리드 (스크롤) — 보유 옷만 */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 gap-2 pb-28">
            <DefaultCard active={equipped === null} onClick={unequip} />
            {ownedClothes.map((cloth) => (
              <GridCard
                key={cloth.id}
                cloth={cloth}
                owned
                equipped={equipped === cloth.id}
                objectSrc={clothPath('chi', cloth.id, 'object')}
                onClick={() => handleClothClick(cloth)}
              />
            ))}
          </div>
          {owned.length === 0 && (
            <div className="text-text-muted mt-6 text-center text-[13px] leading-relaxed">
              아직 뽑은 옷이 없어요!
              <br />
              가챠를 돌려보세요 🎰
            </div>
          )}
        </div>

        {/* 도감 버튼 + 가챠 버튼 + 천장 카운터 */}
        <div className="absolute right-4 bottom-4 z-[2] flex flex-col items-end gap-1.5">
          <CatalogButton
            ownedCount={owned.length}
            total={ALL_CLOTHES.length}
            onClick={() => setCatalogOpen(true)}
          />
          {pity > 0 && (
            <span className="bg-bg-card/90 text-text-muted rounded-full px-2 py-0.5 text-[10px]">
              B {pity}연속 / 10회 천장
            </span>
          )}
          <IconCostButton
            iconSrc={CAPSULE_ICON_PATH}
            iconAlt="가챠"
            label="가챠"
            cost={GACHA_COST}
            onClick={handleGacha}
          />
        </div>
      </PixelCard>

      <CenterModal open={!!selected} onClose={() => setSelectedId(null)}>
        {selected &&
          (selectedOwned ? (
            <ClothDetail
              cloth={selected}
              onUnequip={() => {
                unequip()
                setSelectedId(null)
              }}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <UnownedDetail onClose={() => setSelectedId(null)} />
          ))}
      </CenterModal>

      <CenterModal
        open={gachaResult !== null}
        onClose={() => setGachaResult(null)}
      >
        {gachaResult && (
          <GachaResultModal
            result={gachaResult}
            onEquip={(id) => {
              toggleEquip(id)
              setGachaResult(null)
            }}
            onClose={() => setGachaResult(null)}
          />
        )}
      </CenterModal>

      <CenterModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        title="도감"
        zIndex={70}
      >
        <CatalogContent
          owned={owned}
          filter={catalogFilter}
          setFilter={setCatalogFilter}
          onSelect={(d) => setCatalogDetail(d)}
        />
      </CenterModal>

      <CenterModal
        open={catalogDetail !== null}
        onClose={() => setCatalogDetail(null)}
        zIndex={80}
      >
        {catalogDetail && (
          <CatalogDetail
            detail={catalogDetail}
            onClose={() => setCatalogDetail(null)}
          />
        )}
      </CenterModal>
    </div>
  )
}

// 그리드 첫 칸 — 스킨 해제(기본 츄와와).
function DefaultCard({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'border-ink-base shadow-icon-button-rest relative flex aspect-square cursor-pointer flex-col items-center justify-center',
        'rounded-xl border-2 border-solid bg-pink-50 px-1.5 pt-1.5 pb-6 select-none',
        active && '-translate-y-0.5 ring-2 ring-orange-500',
      )}
    >
      {active && (
        <div
          aria-label="장착됨"
          className="border-ink-base absolute top-1 right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-solid bg-orange-500 text-xs leading-none text-white"
        >
          ✓
        </div>
      )}
      <img
        src={CHARACTER_ASSETS.chihuahua}
        alt=""
        draggable={false}
        className="pointer-events-none h-14 w-14 object-contain"
      />
      <div className="absolute bottom-1.5 left-1/2 flex w-fit -translate-x-1/2 flex-row items-center gap-1.5 rounded-full border-[1.5px] border-gray-200 pr-2 whitespace-nowrap">
        <span className="flex w-9 items-center justify-center rounded-full border-[2px] border-solid border-stone-300 bg-stone-100 py-[3px] text-[8px] leading-none font-bold text-stone-500">
          기본
        </span>
        <div className="text-ink-base text-[10px] leading-tight">
          기본 츄와와
        </div>
      </div>
    </div>
  )
}

// 미보유 옷 팝업.
function UnownedDetail({ onClose }: { onClose: () => void }) {
  return (
    <div className="gap-lg flex flex-col items-center py-2 text-center">
      <div className="text-5xl leading-none">❔</div>
      <div className="flex flex-col gap-1">
        <div className="text-ink-base text-lg font-bold">???</div>
        <div className="text-text-muted text-sm">???</div>
      </div>
      <PixelButton onClick={onClose}>닫기</PixelButton>
    </div>
  )
}

// 옷 정보 블록 (등급/이미지/이름/설명/효과/페어) — 상세·가챠·도감 공용.
function ClothInfo({
  cloth,
  imageKind = 'full',
  imageClass = 'h-20 w-20 object-contain',
}: {
  cloth: ClothEntry
  imageKind?: 'full' | 'object'
  imageClass?: string
}) {
  const grade = GRADE_TOKENS[cloth.grade]
  const effects = cloth.effects ? effectLabel(cloth.effects) : []
  const fancy = cloth.grade === 'S' || cloth.grade === 'S+'

  return (
    <>
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-bold',
          grade.bg,
          grade.border,
          grade.text,
        )}
      >
        {fancy ? `✨ ${cloth.grade} ✨` : cloth.grade}
      </span>

      <ObjectImage
        src={clothPath('chi', cloth.id, imageKind)}
        className={imageClass}
      />

      <div className="flex flex-col gap-1">
        <div className="text-ink-base text-lg font-bold">{cloth.name}</div>
        {cloth.description && (
          <div className="text-text-muted text-sm">{cloth.description}</div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {effects.length > 0 ? (
          effects.map((line) => (
            <div key={line} className="text-text-accent text-sm font-bold">
              {line}
            </div>
          ))
        ) : (
          <div className="text-text-muted text-sm">효과 없음</div>
        )}
        {cloth.pair && (
          <div className="text-text-muted text-xs">냐냐도 같이 입어요 🐱</div>
        )}
      </div>
    </>
  )
}

// 보유 + 장착 중 상세 팝업.
function ClothDetail({
  cloth,
  onUnequip,
  onClose,
}: {
  cloth: ClothEntry
  onUnequip: () => void
  onClose: () => void
}) {
  return (
    <div className="gap-lg flex flex-col items-center text-center">
      <ClothInfo cloth={cloth} />
      <div className="gap-md flex flex-row">
        <PixelButton variant="secondary" onClick={onUnequip}>
          해제하기
        </PixelButton>
        <PixelButton onClick={onClose}>닫기</PixelButton>
      </div>
    </div>
  )
}

// 도감 진입 버튼 (가챠 버튼 위).
function CatalogButton({
  ownedCount,
  total,
  onClick,
}: {
  ownedCount: number
  total: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-ink-base bg-bg-icon-button flex cursor-pointer items-center gap-2 rounded-xl border-2 border-solid px-3 py-2 shadow-[2px_2px_0_var(--color-ink-base)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className="text-xl leading-none">📖</span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-ink-base text-sm font-bold">도감</span>
        <span className="text-text-muted text-xs">
          {ownedCount} / {total}
        </span>
      </span>
    </button>
  )
}

// 도감 등급 필터 탭.
function FilterTabs({
  filter,
  setFilter,
}: {
  filter: CatalogFilter
  setFilter: (f: CatalogFilter) => void
}) {
  return (
    <div className="flex flex-row justify-center gap-1.5">
      {CATALOG_FILTERS.map(({ key, label }) => {
        const selected = filter === key
        const selectedClass =
          key === 'all'
            ? 'border-ink-base bg-pink-300 text-ink-base'
            : clsx(
                GRADE_TOKENS[key].bg,
                GRADE_TOKENS[key].border,
                GRADE_TOKENS[key].text,
              )
        return (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={clsx(
              'cursor-pointer rounded-full border-2 border-solid px-3 py-1 text-xs font-bold',
              selected ? selectedClass : 'text-text-muted border-transparent',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// 도감 모달 내용 — 필터 탭 + 전체 26벌 수집 현황 그리드.
function CatalogContent({
  owned,
  filter,
  setFilter,
  onSelect,
}: {
  owned: string[]
  filter: CatalogFilter
  setFilter: (f: CatalogFilter) => void
  onSelect: (detail: ClothEntry | 'locked') => void
}) {
  const filtered = ALL_CLOTHES.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'S') return c.grade === 'S' || c.grade === 'S+'
    return c.grade === filter
  })

  return (
    <div className="gap-md flex flex-col">
      <FilterTabs filter={filter} setFilter={setFilter} />
      <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto pr-1">
        {filtered.map((cloth) => {
          const isOwned = owned.includes(cloth.id)
          return (
            <GridCard
              key={cloth.id}
              cloth={cloth}
              owned={isOwned}
              equipped={false}
              objectSrc={clothPath('chi', cloth.id, 'object')}
              onClick={() => onSelect(isOwned ? cloth : 'locked')}
            />
          )
        })}
      </div>
    </div>
  )
}

// 도감 설명 팝업 (보기 전용 — 장착 버튼 없음).
function CatalogDetail({
  detail,
  onClose,
}: {
  detail: ClothEntry | 'locked'
  onClose: () => void
}) {
  if (detail === 'locked') {
    return (
      <div className="gap-lg flex flex-col items-center text-center">
        <div className="text-5xl leading-none">🔒</div>
        <div className="flex flex-col gap-1">
          <div className="text-ink-base text-lg font-bold">???</div>
          <div className="text-text-muted text-sm">???</div>
        </div>
        <PixelButton onClick={onClose}>닫기</PixelButton>
      </div>
    )
  }

  return (
    <div className="gap-lg flex flex-col items-center text-center">
      <ClothInfo cloth={detail} />
      <PixelButton onClick={onClose}>닫기</PixelButton>
    </div>
  )
}

// 오브젝트 이미지 — 자산 없으면 이모지 폴백.
function ObjectImage({ src, className }: { src: string; className?: string }) {
  const [errored, setErrored] = useState(false)
  if (errored) {
    return (
      <div
        aria-hidden="true"
        className={clsx('flex items-center justify-center', className)}
      >
        <span className="text-4xl leading-none">👕</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setErrored(true)}
      className={className}
    />
  )
}

// 가챠 결과 팝업 — 코인 부족 / 뽑기 성공.
function GachaResultModal({
  result,
  onEquip,
  onClose,
}: {
  result: GachaResult
  onEquip: (id: string) => void
  onClose: () => void
}) {
  if (result.error) {
    return (
      <div className="gap-lg flex flex-col items-center text-center">
        <div className="text-5xl leading-none">😢</div>
        <div className="text-ink-base text-sm whitespace-pre-line">
          {result.message}
        </div>
        <PixelButton onClick={onClose}>닫기</PixelButton>
      </div>
    )
  }

  const { cloth, alreadyOwned } = result

  return (
    <div className="gap-lg flex flex-col items-center text-center">
      <ClothInfo
        cloth={cloth}
        imageKind="object"
        imageClass="h-18 w-18 object-contain"
      />

      {alreadyOwned ? (
        <div className="text-text-muted text-sm">(이미 보유 중)</div>
      ) : (
        <div
          className="text-sm font-bold"
          style={{ color: 'var(--color-game-warn)' }}
        >
          획득!
        </div>
      )}

      <div className="gap-md flex flex-row">
        {!alreadyOwned && (
          <PixelButton variant="secondary" onClick={() => onEquip(cloth.id)}>
            바로 입기
          </PixelButton>
        )}
        <PixelButton onClick={onClose}>닫기</PixelButton>
      </div>
    </div>
  )
}
