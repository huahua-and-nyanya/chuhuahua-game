import type { ReactNode } from 'react'

export function PreviewSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-md)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export function PreviewRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-sm)',
      }}
    >
      <span
        style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          gap: 'var(--gap-md)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {children}
      </div>
    </div>
  )
}
