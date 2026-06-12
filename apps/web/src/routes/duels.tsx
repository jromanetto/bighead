import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/duels')({
  head: () => ({
    meta: [
      { title: 'Duels · BIGHEAD' },
      {
        name: 'description',
        content:
          'Affronte un autre joueur en duel 1v1 asynchrone : 10 questions chacun, le meilleur score gagne. Défie un ami par lien.',
      },
    ],
  }),
  component: DuelsLayout,
})

function DuelsLayout() {
  return <Outlet />
}
