import { createFileRoute } from '@tanstack/react-router'
import clsx from 'clsx'
import type { ReactNode } from 'react'

import { PixelCard } from '@/ui/PixelCard'

export const Route = createFileRoute('/howto')({
  component: HowToPage,
})

function HowToPage() {
  return (
    <div className="px-4 py-4">
      {/* /ranking과 동일 프레임 — PixelCard padding=0 + scroll wrapper에 dashed border 통합 */}
      <PixelCard
        padding="0"
        className="relative mx-auto max-h-[calc(100dvh-96px)] w-full max-w-[640px]"
      >
        <CornerDots />
        <div className="m-4 max-h-[calc(100dvh-128px)] overflow-y-auto rounded-xl border border-dashed border-pink-300">
          <div className="px-8 py-5 max-md:px-4 max-md:py-5">
            {/* 헤더 */}
            <div className="mb-3 flex flex-col py-6 text-center">
              <h1 className="font-display text-text-primary mb-2 text-[28px] leading-[1.1] font-bold">
                ❓ 플레이 방법
              </h1>
              <p className="text-text-muted text-[13px]">
                츄와와의 뽀뽀 돌격, 시작해볼까요?
              </p>
            </div>

            {/* 게임 소개 박스 */}
            <div className="border-ink-base text-text-primary mb-6 rounded-md border-2 border-solid bg-pink-300 px-4 py-5 text-[13px] leading-[1.7]">
              도망가는 고양이를 쫓아가서{' '}
              <b className="text-text-accent">뽀뽀 💋</b>를 성공시키는
              게임이에요. 고양이는 츄와와가 가까워지면 도망가고, 츄와와는 점점
              빨라지며 다양한 아이템을 활용할 수 있어요.
            </div>

            {/* ============ 솔로 모드 ============ */}
            <SectionTitle>🎮 혼자서 모드</SectionTitle>
            <div className="flex w-full flex-col items-baseline justify-center gap-1 pt-3 pb-2">
              <SectionItem>
                <b>조작 :</b> WASD 또는 방향키로 츄와와 이동 / 스페이스바로도
                시작 가능
              </SectionItem>
              <SectionItem>
                <b>목표 :</b> 뽀뽀 횟수로 점수를 쌓고 LV 1 → LV 10까지 도달
              </SectionItem>
              <div className="text-text-primary mb-4 text-[13px] leading-[1.6]">
                <b>주의 :</b> 게임 시작 약 13초 후부터{' '}
                <b className="text-text-accent">비둘기 🕊️</b>가 등장해요. 레벨이
                오를수록 더 자주, 여러 마리가 한꺼번에 나와요. 빨간 경고 마커를
                보고 미리 피하세요. 맞으면 게임 오버!
              </div>
            </div>

            <ItemBox title="💎 솔로 아이템">
              <ItemRow icon="🦴" name="사료">
                츄와와 부스트 (속도 ×1.55, 5초)
              </ItemRow>
              <ItemRow icon="🐟" name="물고기">
                고양이에게 쉴드 부여 (비둘기 1회 차단, 5초)
              </ItemRow>
              <div className="text-text-muted mt-2 text-[11px]">
                ※ LV 3부터 디버프 아이템도 등장해요 (🥒 오이 / 🍠 고구마)
              </div>
            </ItemBox>

            {/* ============ PvP 모드 ============ */}
            <SectionTitle>⚔️ 둘이서 모드 (PvP)</SectionTitle>
            <div className="flex w-full flex-col items-baseline justify-center gap-1 pt-3 pb-2">
              <SectionItem>
                <b>조작 :</b> 츄와와는 <b>WASD</b>, 고양이는 <b>방향키 ↑↓←→</b>
              </SectionItem>
              <SectionItem>
                <b>목표 :</b>{' '}
                <b className="text-text-accent">30초 내 뽀뽀 10회</b>면 츄와와
                승! 시간 다 가면 고양이 승!
              </SectionItem>
              <div className="text-text-primary mb-4 text-[13px] leading-[1.6]">
                <b>시작 :</b> 두 플레이어 모두 자기 키를 한 번씩 눌러서 준비 →{' '}
                <b>Enter</b> 또는 시작 버튼
              </div>
            </div>
            <ItemBox title="💎 PvP 아이템 (전용)">
              <ItemRow icon="🦴" name="사료">
                츄와와만 픽업 가능. 부스트 ×1.55 (5초)
              </ItemRow>
              <ItemRow icon="🥒" name="오이">
                고양이만 픽업 가능. 고양이 부스트 ×1.85 (3초)
              </ItemRow>
              <ItemRow icon="🐟" name="물고기">
                둘 다 픽업 가능. 쉴드 부여 (또는 디버프 해제)
              </ItemRow>
              <ItemRow icon="🍠" name="고구마">
                둘 다 픽업 가능. 상대방 슬로우 ×0.55 (3초)
              </ItemRow>
            </ItemBox>

            {/* PvP 꿀팁 박스 */}
            <div className="border-ink-base rounded-md border-2 border-solid bg-pink-300 px-4 py-4">
              <div className="text-text-primary mb-3 text-[13px] font-bold">
                ✨ PvP 꿀팁
              </div>
              <div className="text-text-primary flex flex-col gap-2 text-[12px] leading-[1.8]">
                <div>
                  • <b>실드</b>는 츄와와 뽀뽀 1회 또는 디버프 1회를 막아줘요
                </div>
                <div>
                  • 부스트와 슬로우는 서로 <b>상쇄</b>돼요 (둘 다 평속 복귀)
                </div>
                <div>
                  • 슬로우 걸린 상태에서 🐟 물고기 먹으면 슬로우만 해제 (실드 X)
                </div>
              </div>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}

// ── 공용 ────────────────────────────────────────────────────────────

function CornerDots() {
  // /ranking과 동일 — dashed border가 inset-4 (16px), 도트는 안쪽 8px = top-6 (24px)
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

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-text-primary mb-3 border-b-[3px] border-solid border-pink-700 pb-4 text-[18px] font-bold">
      {children}
    </div>
  )
}

function SectionItem({ children }: { children: ReactNode }) {
  return (
    <div className="text-text-primary mb-3 text-[13px] leading-[1.6]">
      {children}
    </div>
  )
}

function ItemBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-ink-base bg-bg-card mb-6 rounded-md border-2 border-dashed px-4 py-5">
      <div className="text-text-primary mb-5 text-[14px] font-bold">
        {title}
      </div>
      <div className="text-text-primary flex flex-col gap-2 text-[12px] leading-[1.8]">
        {children}
      </div>
    </div>
  )
}

// 아이템 row — 데스크탑은 한 줄(이모지+이름 : 설명), 모바일은 col stack + `:` 숨김
function ItemRow({
  icon,
  name,
  children,
}: {
  icon: string
  name: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center max-md:flex-col max-md:items-start max-md:gap-1">
      <div className="flex w-15 items-center gap-1 max-md:w-auto">
        {icon}
        <b>{name}</b>
      </div>
      <div className="mr-2 max-md:hidden">:</div>
      <span>{children}</span>
    </div>
  )
}
