
import { formatDate, formatDateRange, calculateTripDuration, getDaysUntilTrip } from '../../shared/utils'
import { Trip } from '../types/trip'
import { WeatherData } from '../../weather/types/weather'
import styles from './TripCard.module.css'

interface TripCardProps {
  trip: Trip
  onEdit?: (trip: Trip) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
  weatherData?: WeatherData | null
  weatherLoading?: boolean
  weatherError?: string | null
  onLoadWeather?: (destination: string) => void
}

export function TripCard({ 
  trip, 
  onEdit, 
  onDelete, 
  isLoading = false,
  weatherData,
  weatherLoading = false,
  weatherError,
  onLoadWeather
}: TripCardProps) {
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
    <article className={`${styles.tripCard} ${isLoading ? styles.loading : ''}`}>
      <header className={styles.header}>
        <h3 className={styles.title}>{trip.name}</h3>
        <div className={`${styles.status} ${styles[getStatusClass()]}`}>
          {getTripStatus()}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Destination:</span>
          <span className={`${styles.detailValue} ${styles.destination}`}>{trip.destination}</span>
        </div>
        
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Dates:</span>
          <span className={`${styles.detailValue} ${styles.dateRange}`}>{dateRange}</span>
        </div>
        
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Duration:</span>
          <span className={`${styles.detailValue} ${styles.duration}`}>
            {duration} {duration === 1 ? 'day' : 'days'}
          </span>
        </div>
        
        <div className={`${styles.detail} ${styles.timestamps}`}>
          <span className={styles.detailLabel}>
            {trip.updatedAt.getTime() !== trip.createdAt.getTime() ? 'Last edited:' : 'Added:'}
          </span>
          <span className={styles.detailValue}>
            {formatDate(trip.updatedAt.getTime() !== trip.createdAt.getTime() ? trip.updatedAt : trip.createdAt)}
          </span>
        </div>
      </div>

      {/* Weather Section */}
      <div className={styles.weatherSection}>
        {weatherLoading && (
          <div className={styles.weatherLoading}>
            <span className={styles.weatherIcon}>🌤️</span>
            <span>Loading weather...</span>
          </div>
        )}
        
        {weatherError && (
          <div className={styles.weatherError}>
            <span className={styles.weatherIcon}>⚠️</span>
            <span>Weather unavailable</span>
            {onLoadWeather && (
              <button 
                onClick={() => onLoadWeather(trip.destination)}
                className={styles.weatherRetryButton}
                type="button"
              >
                Retry
              </button>
            )}
          </div>
        )}
        
        {weatherData && !weatherLoading && !weatherError && (
          <div className={styles.weatherInfo}>
            <div className={styles.weatherCurrent}>
              <span className={styles.weatherIcon}>🌤️</span>
              <span className={styles.weatherTemp}>
                {Math.round(weatherData.current.temperature)}°C
              </span>
              <span className={styles.weatherDescription}>
                {weatherData.current.description}
              </span>
            </div>
            <div className={styles.weatherDetails}>
              <span>💧 {weatherData.current.humidity}%</span>
              <span>💨 {weatherData.current.windSpeed} km/h</span>
            </div>
          </div>
        )}
        
        {!weatherData && !weatherLoading && !weatherError && onLoadWeather && (
          <button 
            onClick={() => onLoadWeather(trip.destination)}
            className={styles.weatherLoadButton}
            type="button"
          >
            <span className={styles.weatherIcon}>🌤️</span>
            Load Weather
          </button>
        )}
      </div>

      {(onEdit || onDelete) && (
        <footer className={styles.actions}>
          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              disabled={isLoading}
              aria-label={`Edit ${trip.name}`}
              className={styles.editButton}
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
              className={styles.deleteButton}
            >
              Delete
            </button>
          )}
        </footer>
      )}
    </article>
  )
}