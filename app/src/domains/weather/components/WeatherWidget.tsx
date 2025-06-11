import { WeatherData } from '../types/weather'
import { formatDate } from '../../shared/utils'

import styles from './WeatherWidget.module.css'

interface WeatherWidgetProps {
  weatherData: WeatherData | null
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export function WeatherWidget({ 
  weatherData, 
  isLoading, 
  error, 
  onRetry 
}: WeatherWidgetProps) {
  if (error) {
    return (
      <div className={styles.weatherWidget}>
        <div className={styles.error}>
          <p>Weather unavailable</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className={styles.retryButton}
              type="button"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.weatherWidget}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading weather...</p>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className={styles.weatherWidget}>
        <div className={styles.noData}>
          <p>No weather data available</p>
        </div>
      </div>
    )
  }

  const { current, location, lastUpdated } = weatherData

  return (
    <div className={styles.weatherWidget}>
      <div className={styles.header}>
        <h3 className={styles.location}>{location}</h3>
        <div className={styles.lastUpdated}>
          Updated: {formatDate(lastUpdated)}
        </div>
      </div>
      
      <div className={styles.currentWeather}>
        <div className={styles.temperature}>
          <span className={styles.tempValue}>{Math.round(current.temperature)}°</span>
          <span className={styles.tempUnit}>C</span>
        </div>
        
        <div className={styles.weatherInfo}>
          <div className={styles.description}>
            {current.description}
          </div>
          
          <div className={styles.details}>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Humidity:</span>
              <span className={styles.detailValue}>{current.humidity}%</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Wind:</span>
              <span className={styles.detailValue}>{current.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}