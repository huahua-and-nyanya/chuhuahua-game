import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import clsx from 'clsx'

import { CHARACTER_ASSETS } from '@/assets'
import { WARDROBE_BG } from '@/assets/backgrounds'
import { CAPSULE_ICON_PATH, COIN_ICON_PATH, clothPath } from '@/assets/clothes'
import type {
  ClothEffects,
  ClothEntry,
  GachaResult,
} from '@/features/wardrobe/types'
import { CLOTHES, STORY_CLOTH_IDS } from '@/features/wardrobe/clothes'
import { GRADE_TOKENS } from '@/features/wardrobe/grades'
import { useWardrobe } from '@/features/wardrobe/useWardrobe'
import { CenterModal } from '@/ui/CenterModal'
import { CoinChip } from '@/ui/CoinChip'
import { GridCard } from '@/ui/GridCard'
import { PixelButton } from '@/ui/PixelButton'

export const Route = createFileRoute('/wardrobe')({
  component: WardrobePage,
})

const ALL_CLOTHES = Object.values(CLOTHES)

type CatalogFilter = 'all' | 'B' | 'A' | 'S'

const CATALOG_FILTERS: { key: CatalogFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'B', label: 'B' },
  { key: 'A', label: 'A' },
  { key: 'S', label: 'S' },
]

// 스토리(웨딩 해금) 필수 옷 — id 화이트리스트(STORY_CLOTH_IDS, features/wardrobe)로 판별.
// 도감 설명 모달에서만 스토리 칩 표시 (다른 사용처엔 미노출).
function isStoryCloth(cloth: ClothEntry): boolean {
  return (STORY_CLOTH_IDS as readonly string[]).includes(cloth.id)
}

// 등급 필터 매칭 — 'S' 탭은 S/S+ 모두 포함. 그리드·도감 공용.
function matchesFilter(cloth: ClothEntry, filter: CatalogFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'S') return cloth.grade === 'S' || cloth.grade === 'S+'
  return cloth.grade === filter
}

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
// 옷 갈아입을 때마다 통통 2번(냐냐 kiss-bounce와 동일: y -14px / scale 1.1, 0.5s) 점프.
// 호출부에서 key={equipped}로 remount → mount 시 1회 재생되어 매 착용마다 반복.
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
    <motion.img
      src={errored ? fallbackSrc : src}
      alt={alt}
      draggable={false}
      onError={() => setErrored(true)}
      className={className}
      initial={{ y: 0, scale: 1 }}
      animate={{ y: [0, -14, 0, -14, 0], scale: [1, 1.1, 1, 1.1, 1] }}
      transition={{ duration: 0.5, times: [0, 0.25, 0.5, 0.75, 1] }}
    />
  )
}

function WardrobePage() {
  const { coins, owned, equipped, usedClothes, toggleEquip, pullGacha } =
    useWardrobe()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null)
  // wedding 착용 안내모달 대기 중인 옷 id (현재 'wedding'만). null이면 모달 닫힘.
  const [weddingEquipPrompt, setWeddingEquipPrompt] = useState<string | null>(
    null,
  )
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('all')
  const [gridFilter, setGridFilter] = useState<CatalogFilter>('all')
  const [catalogDetail, setCatalogDetail] = useState<
    ClothEntry | 'locked' | null
  >(null)

  const handleGacha = () => {
    setGachaResult(pullGacha())
  }

  const ownedClothes = ALL_CLOTHES.filter((c) => owned.includes(c.id)).filter(
    (c) => matchesFilter(c, gridFilter),
  )
  const selected = selectedId ? CLOTHES[selectedId] : null
  const selectedOwned = selectedId ? owned.includes(selectedId) : false

  // 장착 요청 공통 — wedding이고 엔딩 미시청이면 안내모달 경유, 그 외엔 즉시 장착.
  // 클릭 즉시장착 / 가챠 바로입기 두 진입점이 같이 사용.
  const requestEquip = (id: string) => {
    if (id === 'wedding' && !usedClothes.includes('wedding')) {
      setWeddingEquipPrompt(id)
      return
    }
    toggleEquip(id)
  }

  const handleClothClick = (cloth: ClothEntry) => {
    if (!owned.includes(cloth.id)) {
      setSelectedId(cloth.id) // 미보유 → ??? 팝업
      return
    }
    if (equipped === cloth.id) {
      setSelectedId(cloth.id) // 장착 중 → 상세 팝업
      return
    }
    requestEquip(cloth.id) // 보유 미장착 → 즉시 장착(wedding&&!used면 안내모달)
  }

  const unequip = () => {
    if (equipped) toggleEquip(equipped)
  }

  const fittingSrc = equipped
    ? clothPath('chi', equipped, 'full')
    : CHARACTER_ASSETS.chihuahua

  return (
    // 게임 프레임(640×480 inner)을 직접 꽉 채움 — 자체 카드(PixelCard 점선/둥근 모서리/그림자)
    // 제거로 프레임과의 이중 테두리 회피. /solo의 absolute inset-0 패턴과 동일.
    <div className="bg-bg-card absolute inset-0 flex flex-col overflow-hidden">
      {/* 헤더 — 프레임 상단에 flush */}
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
          backgroundImage: `url(${WARDROBE_BG})`,
          backgroundSize: 'cover',
          // 하단 기준 정렬 — 영역이 좁으면 위를 자르고 아래(바닥)는 유지.
          backgroundPosition: 'center bottom',
        }}
      >
        <FallbackImage
          key={equipped ?? 'none'}
          src={fittingSrc}
          fallbackSrc={CHARACTER_ASSETS.chihuahua}
          alt="피팅룸 츄와와"
          // mt-4: 배경 쿠션 위에 올라선 느낌으로 살짝 아래 배치.
          className="mt-4 h-[130px] w-[130px] object-contain"
        />
      </div>

      {/* 등급 필터 칩 — 도감과 동일(좌측 정렬). 스크롤과 무관하게 항상 보이도록 grid 위 고정. */}
      <div className="border-border-card shrink-0 border-b border-dashed px-3 py-2">
        <FilterTabs filter={gridFilter} setFilter={setGridFilter} />
      </div>

      {/* 그리드 (스크롤) — 보유 옷만 (필터 적용). '전체'에서만 기본 칸 노출. */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2 pb-28">
          {gridFilter === 'all' && (
            <DefaultCard active={equipped === null} onClick={unequip} />
          )}
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
        {ownedClothes.length === 0 && gridFilter !== 'all' && (
          <div className="text-text-muted mt-6 text-center text-[13px]">
            이 등급 옷이 아직 없어요
          </div>
        )}
      </div>

      {/* 도감 버튼 + 가챠 버튼 (천장은 시스템 내부 처리 — UI 노출 안 함) */}
      <div className="absolute right-4 bottom-4 z-[2] flex flex-col items-end gap-1.5">
        <CatalogButton
          ownedCount={owned.length}
          total={ALL_CLOTHES.length}
          onClick={() => setCatalogOpen(true)}
        />
        <GachaButton onClick={handleGacha} />
      </div>

      <CenterModal
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? (selectedOwned ? selected.name : '???') : undefined}
      >
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

      {/* 가챠 결과는 reveal 연출(캡슐 흔들→펑→옷 등장)이 본문에서 이름을 노출하므로
          헤더 title 없음 — 미리 이름이 보이면 reveal이 김 빠짐. */}
      <CenterModal
        open={gachaResult !== null}
        onClose={() => setGachaResult(null)}
      >
        {gachaResult && (
          <GachaResultModal
            result={gachaResult}
            onEquip={(id) => {
              requestEquip(id)
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
        title={
          catalogDetail
            ? catalogDetail === 'locked'
              ? '???'
              : catalogDetail.name
            : undefined
        }
        zIndex={80}
      >
        {catalogDetail && (
          <CatalogDetail
            detail={catalogDetail}
            onClose={() => setCatalogDetail(null)}
          />
        )}
      </CenterModal>

      {/* wedding 착용 안내 — 엔딩 미시청 wedding 장착 시도마다(매번) 표시. used면 requestEquip이 스킵. */}
      <CenterModal
        open={weddingEquipPrompt !== null}
        onClose={() => setWeddingEquipPrompt(null)}
        title="특별한 엔딩이 있어요"
        zIndex={90}
      >
        <WeddingEquipPrompt
          onConfirm={() => {
            if (weddingEquipPrompt) toggleEquip(weddingEquipPrompt)
            setWeddingEquipPrompt(null)
          }}
          onCancel={() => setWeddingEquipPrompt(null)}
        />
      </CenterModal>
    </div>
  )
}

// wedding 착용 안내모달 내용 — 코인부족 모달(GachaResultModal error) 구조 미러.
// 엔딩 안내 + 동작 고지(코인 차단/효과 소멸은 grep 정합 문구). [취소]/[입기] 2버튼.
function WeddingEquipPrompt({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="gap-xl flex flex-col items-center text-center">
      <div className="text-ink-base py-4 text-lg leading-relaxed font-bold">
        이 옷을 입고 플레이하면
        <br />
        둘의 특별한 엔딩을 볼 수 있어요
      </div>
      {/* 동작 고지 — 게임오버/코인부족 모달과 동일한 점선 구분 레이아웃 */}
      <div className="border-border-card flex w-full flex-col gap-2 border-y border-dashed py-7 text-left">
        <div className="text-text-muted text-sm leading-snug">
          · 엔딩(크레딧)을 볼 때까지 코인이 모이지 않아요.
        </div>
        <div className="text-text-muted text-sm leading-snug">
          · 엔딩 시청 시 이 옷의 효과는 사라져요.
        </div>
      </div>
      <div className="gap-sm flex w-full flex-row pt-1">
        <PixelButton variant="secondary" onClick={onCancel}>
          취소
        </PixelButton>
        <PixelButton className="flex-1" onClick={onConfirm}>
          입기
        </PixelButton>
      </div>
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
        className="pointer-events-none h-24 w-24 object-contain"
      />
      <div className="bg-bg-card absolute bottom-1.5 left-1/2 flex w-fit -translate-x-1/2 flex-row items-center gap-1.5 rounded-full border-[1.5px] border-gray-200 pr-2 whitespace-nowrap">
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

// 미열람 옷 정보 블록 — ClothInfo와 동일 레이아웃의 ??? 버전 (이름은 헤더 title='???').
// 등급 뱃지(?) / 자물쇠 이미지 / 설명 ??? / 구분선 / 효과 ???.
function LockedInfo() {
  return (
    <>
      <span className="inline-flex items-center justify-center rounded-full border-2 border-solid border-stone-300 bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-500">
        ?
      </span>
      <div
        aria-hidden="true"
        className="flex h-28 w-28 items-center justify-center text-5xl leading-none"
      >
        🔒
      </div>
      <div className="text-text-muted text-sm">???</div>
      <div className="border-border-card w-full border-t border-dashed" />
      <div className="text-text-muted text-sm">???</div>
    </>
  )
}

// 미보유 옷 팝업 — 미열람 레이아웃 공용(LockedInfo).
function UnownedDetail({ onClose }: { onClose: () => void }) {
  return (
    <div className="gap-lg flex flex-col items-center text-center">
      <LockedInfo />
      <PixelButton className="w-full" onClick={onClose}>
        닫기
      </PixelButton>
    </div>
  )
}

// 옷 정보 블록 (등급/이미지/이름/설명/효과/페어) — 상세·가챠·도감 공용.
function ClothInfo({
  cloth,
  imageKind = 'full',
  imageClass = 'h-28 w-28 object-contain',
  showName = false,
  halo = false,
}: {
  cloth: ClothEntry
  imageKind?: 'full' | 'object'
  imageClass?: string
  // 헤더 title 없이 본문에 이름을 보여줄 때 true (가챠 reveal 전용). 상세 모달은 헤더가 이름 담당.
  showName?: boolean
  // 가챠 reveal 시 아이템 뒤 레벨업과 동일한 후광(회전 conic rays) 표시.
  halo?: boolean
}) {
  const grade = GRADE_TOKENS[cloth.grade]
  const effects = cloth.effects ? effectLabel(cloth.effects) : []
  // 스토리 필수 옷이면 등급칩 옆 📖 칩 — 자체 판정이라 상세/도감/가챠 모든 사용처에 자동 표시.
  const isStory = isStoryCloth(cloth)

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <span
          className={clsx(
            'inline-flex items-center justify-center rounded-full border-2 border-solid px-2.5 py-0.5 text-xs font-bold',
            grade.bg,
            grade.border,
            grade.text,
          )}
        >
          {cloth.grade}
        </span>
        {isStory && (
          <span className="inline-flex items-center justify-center rounded-full border-2 border-solid border-pink-400 bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-pink-700">
            📖 스토리
          </span>
        )}
      </div>

      {/* 이미지 (+ halo: 가챠 reveal 시 레벨업과 동일 후광).
          conic-gradient rgba는 alpha 미세조정이 필요해 토큰화 어려움 →
          LevelUpEffect와 동일하게 인라인 rgba 허용. */}
      <div className="relative flex items-center justify-center">
        {halo && (
          <div
            aria-hidden="true"
            className="animate-level-up-rays pointer-events-none absolute top-1/2 left-1/2"
            style={{
              width: 220,
              height: 220,
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.45) 30deg, transparent 60deg, rgba(255, 61, 127, 0.35) 90deg, transparent 120deg, rgba(251, 191, 36, 0.45) 150deg, transparent 180deg, rgba(255, 61, 127, 0.35) 210deg, transparent 240deg, rgba(251, 191, 36, 0.45) 270deg, transparent 300deg, rgba(255, 61, 127, 0.35) 330deg, transparent 360deg)',
            }}
          />
        )}
        <ObjectImage
          src={clothPath('chi', cloth.id, imageKind)}
          className={clsx('relative', imageClass)}
        />
      </div>

      {/* 이름은 기본적으로 모달 헤더(title) 담당. showName=true(가챠 reveal)일 때만 본문 노출 */}
      {showName && (
        <div className="text-ink-base text-lg font-bold">{cloth.name}</div>
      )}
      {cloth.description && (
        <div className="text-text-muted text-sm">{cloth.description}</div>
      )}

      {/* 내용 ↔ 효과 구분선 (w-full) */}
      <div className="border-border-card w-full border-t border-dashed" />

      {/* 효과 영역 — 옅은 배경 패널로 '효과'를 별도 영역으로 구분 (선이 아닌 영역 구분감) */}
      <div className="flex w-full flex-col gap-2.5 rounded-lg bg-pink-50 px-4 py-3.5">
        {effects.length > 0 ? (
          effects.map((line) => (
            <div
              key={line}
              className="text-text-accent text-sm leading-snug font-bold"
            >
              {line}
            </div>
          ))
        ) : (
          <div className="text-text-muted text-sm">효과 없음</div>
        )}
        {cloth.pair && (
          <div className="text-text-muted text-xs leading-snug">
            냐냐도 같이 입어요 🐱
          </div>
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
      <div className="gap-sm flex w-full flex-row">
        <PixelButton variant="secondary" onClick={onUnequip}>
          해제하기
        </PixelButton>
        <PixelButton className="flex-1" onClick={onClose}>
          닫기
        </PixelButton>
      </div>
    </div>
  )
}

// 도감/가챠 버튼 공통 컨테이너. 모바일에선 게임 프레임이 축소돼 패딩도 같이 줄어드므로
// 축소 후에도 여백이 보이도록 px-5 py-3로 넉넉히 잡는다.
const ICON_ACTION_BTN_CLASSES =
  'border-ink-base bg-bg-icon-button flex cursor-pointer items-center gap-2.5 ' +
  'rounded-xl border-2 border-solid px-5 py-3 ' +
  'shadow-[2px_2px_0_var(--color-ink-base)] transition-transform ' +
  'hover:-translate-y-0.5 active:translate-y-0'

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
    <button type="button" onClick={onClick} className={ICON_ACTION_BTN_CLASSES}>
      <span className="text-xl leading-none">📖</span>
      <span className="flex flex-col items-start gap-1.5 leading-tight">
        <span className="text-ink-base text-sm font-bold">도감</span>
        <span className="text-text-muted text-xs">
          {ownedCount} / {total}
        </span>
      </span>
    </button>
  )
}

// 가챠 진입 버튼 — 비용은 코인 부족 시 모달에서 안내하므로 버튼엔 액션명만 (도감 버튼과 동일 컨테이너).
function GachaButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={ICON_ACTION_BTN_CLASSES}>
      <img
        src={CAPSULE_ICON_PATH}
        alt=""
        aria-hidden="true"
        className="pointer-events-none block h-6 w-6 object-contain"
      />
      <span className="text-ink-base text-sm font-bold">가챠 뽑기</span>
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
    <div className="flex flex-row justify-start gap-2">
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
  const filtered = ALL_CLOTHES.filter((c) => matchesFilter(c, filter))

  return (
    <div className="flex flex-col">
      {/* 필터 헤더 — 그리드와 점선 border로 구분감 */}
      <div className="border-border-card mb-3 border-b border-dashed pb-3">
        <FilterTabs filter={filter} setFilter={setFilter} />
      </div>
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
        <LockedInfo />
        <PixelButton className="w-full" onClick={onClose}>
          닫기
        </PixelButton>
      </div>
    )
  }

  return (
    <div className="gap-lg flex flex-col items-center text-center">
      <ClothInfo cloth={detail} />
      <PixelButton className="w-full" onClick={onClose}>
        닫기
      </PixelButton>
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

// 코인 부족 모달의 필요/보유 코인 1열 (라벨 + 코인 아이콘 + 수치).
function CoinStat({
  label,
  amount,
  color,
}: {
  label: string
  amount: number
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-text-muted text-xs">{label}</span>
      <span
        className="inline-flex items-center gap-1 text-base font-bold"
        style={{ color }}
      >
        <img
          src={COIN_ICON_PATH}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 object-contain"
        />
        {amount}
      </span>
    </div>
  )
}

// 가챠 reveal 연기 puff — 중심에서 5방향으로 퍼지며 사라지는 원. 자산 없이 framer-motion만.
const SMOKE_PUFFS = [
  { dx: 0, dy: -28 },
  { dx: 26, dy: -8 },
  { dx: 18, dy: 24 },
  { dx: -18, dy: 24 },
  { dx: -26, dy: -8 },
]

// 캡슐 reveal 시퀀스(총 1.4s): 흔들→멈춤→흔들→펑(scale↑→0). 펑 타이밍(≈1.15s)에 맞춰
// 연기 puff가 5방향으로 퍼진다. GachaResultModal reveal 타이머(1400ms)와 맞물려 직후 옷 등장.
function GachaReveal() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {SMOKE_PUFFS.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute h-7 w-7 rounded-full bg-stone-300"
          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.6, 1.9],
            opacity: [0, 0.7, 0],
            x: [0, p.dx * 0.6, p.dx],
            y: [0, p.dy * 0.6, p.dy],
          }}
          transition={{ duration: 0.45, delay: 1.15, times: [0, 0.4, 1] }}
        />
      ))}
      <motion.img
        src={CAPSULE_ICON_PATH}
        alt=""
        aria-hidden="true"
        className="relative h-16 w-16 object-contain"
        animate={{
          // 흔들(0~0.35) → 멈춤(0.35~0.5) → 흔들(0.5~0.78) → 펑(0.88 scale↑ → 1.0 사라짐)
          rotate: [0, -14, 14, -14, 14, 0, 0, -14, 14, -14, 14, 0, 0],
          scale: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.3, 0],
        }}
        transition={{
          duration: 1.4,
          times: [
            0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.5, 0.57, 0.64, 0.71, 0.78, 0.88,
            1,
          ],
        }}
      />
    </div>
  )
}

// 가챠 결과 팝업 — 코인 부족 / 뽑기 성공(캡슐 reveal 연출).
function GachaResultModal({
  result,
  onEquip,
  onClose,
}: {
  result: GachaResult
  onEquip: (id: string) => void
  onClose: () => void
}) {
  // reveal 상태 — 캡슐 연출(~1.4s: 흔들→멈춤→흔들→펑) 후 옷/획득/버튼 노출. error엔 연출 없음.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (result.error) return
    const t = setTimeout(() => setRevealed(true), 1400)
    return () => clearTimeout(t)
  }, [result])

  if (result.error) {
    return (
      <div className="gap-lg flex flex-col items-center text-center">
        <div className="text-5xl leading-none">😢</div>
        <div className="text-ink-base text-lg font-bold">코인이 부족해요</div>
        {/* 필요/보유 코인 2열 — 게임오버 모달 스탯 행과 동일한 점선 구분 레이아웃 */}
        <div className="border-border-card flex w-full justify-center gap-10 border-y border-dashed py-4">
          <CoinStat
            label="필요 코인"
            amount={result.cost}
            color="var(--color-game-accent-gold)"
          />
          <CoinStat
            label="보유 코인"
            amount={result.have}
            color="var(--color-danger)"
          />
        </div>
        <PixelButton className="w-full" onClick={onClose}>
          닫기
        </PixelButton>
      </div>
    )
  }

  const { cloth, alreadyOwned, refund } = result

  return (
    <div className="gap-lg flex flex-col items-center text-center">
      {!revealed ? (
        <GachaReveal />
      ) : (
        <motion.div
          className="gap-lg flex w-full flex-col items-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ClothInfo
            cloth={cloth}
            imageKind="object"
            imageClass="h-24 w-24 object-contain"
            showName
            halo
          />
          {alreadyOwned ? (
            <div className="flex flex-col items-center gap-1">
              <div className="text-text-muted text-sm">(이미 보유 중)</div>
              {refund > 0 && (
                <div
                  className="inline-flex items-center gap-1 text-sm font-bold"
                  style={{ color: 'var(--color-game-accent-gold)' }}
                >
                  <img
                    src={COIN_ICON_PATH}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-4 object-contain"
                  />
                  +{refund} 코인 환불
                </div>
              )}
            </div>
          ) : (
            <div
              className="text-sm font-bold"
              style={{ color: 'var(--color-game-warn)' }}
            >
              획득!
            </div>
          )}
        </motion.div>
      )}

      {/* 버튼은 reveal 후 노출 (연출 중엔 모달 X로만 닫기) */}
      {revealed && (
        <div className="gap-sm flex w-full flex-row">
          {!alreadyOwned && (
            <PixelButton variant="secondary" onClick={() => onEquip(cloth.id)}>
              바로 입기
            </PixelButton>
          )}
          <PixelButton className="flex-1" onClick={onClose}>
            닫기
          </PixelButton>
        </div>
      )}
    </div>
  )
}
