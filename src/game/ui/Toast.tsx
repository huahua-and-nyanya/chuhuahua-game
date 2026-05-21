import type { ToastRef } from '@/game/state'

// 우측 위→아래 스택. 라우트의 showToast가 항목을 push하고 until 만료 시 splice.
// MAX_TOASTS는 라우트 측에서 적용 (최신 N개만 push). 본 컴포넌트는 받은 그대로 표시.

export type ToastsProps = {
  toasts: ToastRef[]
}

export function Toasts({ toasts }: ToastsProps) {
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none absolute top-2 right-2 flex flex-col items-end gap-1">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="border-ink-base font-display text-text-on-pink shadow-card rounded-md border-2 px-2 py-1 text-xs"
          style={{ background: t.color }}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}
