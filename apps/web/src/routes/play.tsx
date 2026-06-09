import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/play')({
  head: () => ({ meta: [{ title: 'Jouer · BIGHEAD' }] }),
  component: PlayLayout,
})

function PlayLayout() {
  return <Outlet />
}
