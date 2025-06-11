
import { formatDate, formatDateRange, calculateTripDuration, getDaysUntilTrip } from '../../shared/utils'
import { Trip } from '../types/trip'

interface TripCardProps {
  trip: Trip
  onEdit?: (trip: Trip) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export function TripCard({ trip, onEdit, onDelete, isLoading = false }: TripCardProps) {
  const duration = calculateTripDuration(trip.startDate, trip.endDate)
  const daysUntil = getDaysUntilTrip(trip.startDate)
  const dateRange = formatDateRange(trip.startDate, trip.endDate)

  const handleEdit = () => {
    if (!isLoading && onEdit) {
      onEdit(trip)
    }
  }

  const handleDelete = () => {
    if (!isLoading && onDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${trip.name}"? This action cannot be undone.`
      )
      if (confirmed) {
        onDelete(trip.id)
      }
    }
  }

  const getTripStatus = () => {
    if (daysUntil > 0) {
      return `${daysUntil} days until departure`
    } else if (daysUntil === 0) {
      return 'Departing today!'
    } else {
      const now = new Date()
      if (now <= trip.endDate) {
        return 'Currently on trip'
      } else {
        return 'Trip completed'
      }
    }
  }

  const getStatusClass = () => {
    if (daysUntil > 0) {
      return 'upcoming'
    } else if (daysUntil === 0) {
      return 'departing'
    } else {
      const now = new Date()
      if (now <= trip.endDate) {
        return 'current'
      } else {
        return 'completed'
      }
    }
  }

  return (
    <article>
      <header>
        <h3>{trip.name}</h3>
        <div className={getStatusClass()}>
          {getTripStatus()}
        </div>
      </header>

      <div>
        <div>
          <strong>Destination:</strong> {trip.destination}
        </div>
        
        <div>
          <strong>Dates:</strong> {dateRange}
        </div>
        
        <div>
          <strong>Duration:</strong> {duration} {duration === 1 ? 'day' : 'days'}
        </div>
        
        <div>
          <strong>Created:</strong> {formatDate(trip.createdAt)}
        </div>
        
        {trip.updatedAt.getTime() !== trip.createdAt.getTime() && (
          <div>
            <strong>Last updated:</strong> {formatDate(trip.updatedAt)}
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <footer>
          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              disabled={isLoading}
              aria-label={`Edit ${trip.name}`}
            >
              Edit
            </button>
          )}
          
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              aria-label={`Delete ${trip.name}`}
            >
              Delete
            </button>
          )}
        </footer>
      )}
    </article>
  )
}