import { createFileRoute } from '@tanstack/react-router'
import { MAIN_HERO } from '@/assets'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div
      className="fixed inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${MAIN_HERO})` }}
    />
  )
}
