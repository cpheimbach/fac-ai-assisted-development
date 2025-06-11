
import { Trip } from '../types/trip'
import { TripCard } from './TripCard'

interface TripListProps {
  trips: Trip[]
  onEditTrip?: (trip: Trip) => void
  onDeleteTrip?: (id: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function TripList({ 
  trips, 
  onEditTrip, 
  onDeleteTrip, 
  isLoading = false,
  emptyMessage = "No trips found. Create your first trip to get started!"
}: TripListProps) {
  
  if (trips.length === 0) {
    return (
      <div>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  const sortedTrips = [...trips].sort((a, b) => {
    const now = new Date()
    
    const aStarted = a.startDate <= now
    const bStarted = b.startDate <= now
    
    const aEnded = a.endDate < now
    const bEnded = b.endDate < now
    
    if (!aStarted && !bStarted) {
      return a.startDate.getTime() - b.startDate.getTime()
    }
    
    if (aStarted && !aEnded && bStarted && !bEnded) {
      return a.startDate.getTime() - b.startDate.getTime()
    }
    
    if (aStarted && !aEnded) return -1
    if (bStarted && !bEnded) return 1
    
    if (!aStarted) return -1
    if (!bStarted) return 1
    
    return b.endDate.getTime() - a.endDate.getTime()
  })

  const currentTrips = sortedTrips.filter(trip => {
    const now = new Date()
    return trip.startDate <= now && trip.endDate >= now
  })

  const upcomingTrips = sortedTrips.filter(trip => {
    const now = new Date()
    return trip.startDate > now
  })

  const pastTrips = sortedTrips.filter(trip => {
    const now = new Date()
    return trip.endDate < now
  })

  return (
    <div>
      {currentTrips.length > 0 && (
        <section>
          <h2>Current Trips</h2>
          <div>
            {currentTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={onEditTrip}
                onDelete={onDeleteTrip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      )}

      {upcomingTrips.length > 0 && (
        <section>
          <h2>Upcoming Trips</h2>
          <div>
            {upcomingTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={onEditTrip}
                onDelete={onDeleteTrip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      )}

      {pastTrips.length > 0 && (
        <section>
          <h2>Past Trips</h2>
          <div>
            {pastTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={onEditTrip}
                onDelete={onDeleteTrip}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}