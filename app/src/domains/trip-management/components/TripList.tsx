
import { Trip } from '../types/trip'
import { TripCard } from './TripCard'
import styles from './TripList.module.css'

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
      <div className={styles.emptyState}>
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
    <div className={`${styles.tripList} ${isLoading ? styles.loading : ''}`}>
      {currentTrips.length > 0 && (
        <section className={`${styles.section} ${styles.currentSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Current Trips</h2>
            <span className={styles.sectionBadge}>{currentTrips.length}</span>
          </div>
          <div className={styles.tripsGrid}>
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
        <section className={`${styles.section} ${styles.upcomingSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Trips</h2>
            <span className={styles.sectionBadge}>{upcomingTrips.length}</span>
          </div>
          <div className={styles.tripsGrid}>
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
        <section className={`${styles.section} ${styles.pastSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Past Trips</h2>
            <span className={styles.sectionBadge}>{pastTrips.length}</span>
          </div>
          <div className={styles.tripsGrid}>
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

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
        </div>
      )}
    </div>
  )
}