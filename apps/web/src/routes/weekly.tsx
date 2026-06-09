import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/weekly')({
  head: () => ({ meta: [{ title: 'Défi de la semaine · BIGHEAD' }] }),
  component: WeeklyLayout,
})

function WeeklyLayout() {
  return <Outlet />
}
