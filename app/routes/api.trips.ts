import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import { tripService } from '~/src/domains/trip-management/services/tripService'
import { CreateTripData, UpdateTripData } from '~/src/domains/trip-management/types/trip'

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const destination = url.searchParams.get('destination')
    const filter = url.searchParams.get('filter') // 'upcoming', 'past', 'current'

    if (id) {
      const trip = await tripService.getTripById(id)
      return json({ trip })
    }

    if (destination) {
      const trips = await tripService.getTripsByDestination(destination)
      return json({ trips })
    }

    if (filter) {
      let trips
      switch (filter) {
        case 'upcoming':
          trips = await tripService.getUpcomingTrips()
          break
        case 'past':
          trips = await tripService.getPastTrips()
          break
        case 'current':
          trips = await tripService.getCurrentTrips()
          break
        default:
          trips = await tripService.getAllTrips()
      }
      return json({ trips })
    }

    const trips = await tripService.getAllTrips()
    return json({ trips })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return json({ error: message }, { status: 500 })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()
    const intent = formData.get('intent') as string

    switch (intent) {
      case 'create': {
        const tripData: CreateTripData = {
          name: formData.get('name') as string,
          destination: formData.get('destination') as string,
          startDate: new Date(formData.get('startDate') as string),
          endDate: new Date(formData.get('endDate') as string),
        }

        const trip = await tripService.createTrip(tripData)
        return json({ trip, success: true })
      }

      case 'update': {
        const id = formData.get('id') as string
        const updateData: UpdateTripData = {}

        if (formData.get('name')) {
          updateData.name = formData.get('name') as string
        }
        if (formData.get('destination')) {
          updateData.destination = formData.get('destination') as string
        }
        if (formData.get('startDate')) {
          updateData.startDate = new Date(formData.get('startDate') as string)
        }
        if (formData.get('endDate')) {
          updateData.endDate = new Date(formData.get('endDate') as string)
        }

        const trip = await tripService.updateTrip(id, updateData)
        return json({ trip, success: true })
      }

      case 'delete': {
        const id = formData.get('id') as string
        const deleted = await tripService.deleteTrip(id)
        return json({ deleted, success: true })
      }

      default:
        return json({ error: 'Invalid intent' }, { status: 400 })
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return json({ error: message, success: false }, { status: 500 })
  }
}