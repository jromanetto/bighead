import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/play')({ component: Play })

function Play() {
  return <h1 className="text-3xl font-bold">Play</h1>
}
