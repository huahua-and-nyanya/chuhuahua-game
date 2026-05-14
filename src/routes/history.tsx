import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">내 기록</h1>
      <p className="text-sm">placeholder</p>
      <Link to="/" className="rounded-md border px-4 py-2">
        메인으로
      </Link>
    </main>
  )
}
