import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({ component: Profile })

function Profile() {
  return <h1 className="text-3xl font-bold">Profile</h1>
}
