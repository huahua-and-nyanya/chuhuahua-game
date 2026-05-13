import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/multi/')({
  component: MultiHubPage,
})

const SUB_MODES = [
  { to: '/multi/local', label: '로컬 PvP' },
  { to: '/multi/random', label: '랜덤 매치' },
  { to: '/multi/room', label: '방 매칭' },
] as const

function MultiHubPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">멀티플레이</h1>
      <nav className="flex w-full max-w-xs flex-col gap-3">
        {SUB_MODES.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="rounded-md border px-4 py-2 text-center"
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link to="/" className="rounded-md border px-4 py-2">
        메인으로
      </Link>
    </main>
  )
}
