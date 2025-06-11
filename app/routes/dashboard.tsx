import type { MetaFunction } from '@remix-run/node'

import { TripDashboard } from '~/src/domains/trip-management/components/TripDashboard'

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - Travel Planning App' },
    { name: 'description', content: 'Manage your trips and check destination weather' },
  ]
}

export default function Dashboard() {
  return <TripDashboard />
}