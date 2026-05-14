import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const MODES = [
  { to: '/solo', label: '솔로 엔드리스' },
  { to: '/multi', label: '멀티플레이' },
  { to: '/wardrobe', label: '옷장' },
  { to: '/gacha', label: '가챠' },
  { to: '/leaderboard', label: '랭킹' },
  { to: '/history', label: '내 기록' },
] as const

function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 p-8">
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold">츄와와 ~뽀뽀 돌격~</h1>
        <p className="text-base">뽀뽀하려는 츄와와 vs 죽어도 싫은 고양이</p>
      </header>
      <nav className="flex w-full max-w-xs flex-col gap-3">
        {MODES.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="rounded-md border px-4 py-2 text-center"
          >
            {label}
          </Link>
        ))}
      </nav>
    </main>
  )
}
