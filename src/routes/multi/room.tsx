import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/multi/room')({
  component: RoomMatchPage,
})

function RoomMatchPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">방 매칭</h1>
      <p className="text-sm">placeholder</p>
      <Link to="/" className="rounded-md border px-4 py-2">
        메인으로
      </Link>
    </main>
  )
}
