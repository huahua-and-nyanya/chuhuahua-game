import type { ToastRef } from '@/game/state'

// HUD 우상단 stack의 자식으로 렌더 — 위치/정렬은 부모(HUD) 책임.
// 검정 배경 + 흰 글씨로 통일 (HUD 흰 칩과 영구/임시 위계 구분).
// ToastRef.color는 호환성 위해 받지만 본 컴포넌트에선 무시.

export type ToastsProps = {
  toasts: ToastRef[]
}

export function Toasts({ toasts }: ToastsProps) {
  if (toasts.length === 0) return null
  return (
    <>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-ink-base text-text-on-pink rounded-pill px-md py-xs text-sm font-medium whitespace-nowrap"
        >
          {t.text}
        </div>
      ))}
    </>
  )
}
