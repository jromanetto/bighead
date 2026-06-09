import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/duels')({
  head: () => ({ meta: [{ title: 'Duels · BIGHEAD' }] }),
  component: DuelsLayout,
})

function DuelsLayout() {
  return <Outlet />
}
