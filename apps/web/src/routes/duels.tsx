import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/duels')({ component: DuelsLayout })

function DuelsLayout() {
  return <Outlet />
}
