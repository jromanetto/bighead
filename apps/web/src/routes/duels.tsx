import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/duels')({ component: Duels })

function Duels() {
  return <h1 className="text-3xl font-bold">Duels</h1>
}
