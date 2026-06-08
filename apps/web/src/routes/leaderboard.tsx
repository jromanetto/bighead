import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/leaderboard')({ component: Leaderboard })

function Leaderboard() {
  return <h1 className="text-3xl font-bold">Leaderboard</h1>
}
