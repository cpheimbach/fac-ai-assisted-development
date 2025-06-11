import type { MetaFunction } from '@remix-run/node'

import { TripDashboard } from '~/src/domains/trip-management/components/TripDashboard'

export const meta: MetaFunction = () => {
  return [
    { title: 'Travel Planning App' },
    { name: 'description', content: 'Plan your trips and check the weather!' },
  ]
}

export default function Index() {
  return <TripDashboard />
}
