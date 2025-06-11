import { WeatherData } from '../types/weather'
import { formatDateShort } from '../../shared/utils'

import styles from './WeatherForecast.module.css'

interface WeatherForecastProps {
  weatherData: WeatherData | null
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export function WeatherForecast({ 
  weatherData, 
  isLoading, 
  error, 
  onRetry 
}: WeatherForecastProps) {
  if (error) {
    return (
      <div className={styles.weatherForecast}>
        <div className={styles.header}>
          <h3>Weather Forecast</h3>
        </div>
        <div className={styles.error}>
          <p>Forecast unavailable</p>
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
      <div className={styles.weatherForecast}>
        <div className={styles.header}>
          <h3>Weather Forecast</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading forecast...</p>
        </div>
      </div>
    )
  }

  if (!weatherData || !weatherData.forecast || weatherData.forecast.length === 0) {
    return (
      <div className={styles.weatherForecast}>
        <div className={styles.header}>
          <h3>Weather Forecast</h3>
        </div>
        <div className={styles.noData}>
          <p>No forecast data available</p>
        </div>
      </div>
    )
  }

  const { forecast, location } = weatherData

  return (
    <div className={styles.weatherForecast}>
      <div className={styles.header}>
        <h3>Weather Forecast - {location}</h3>
      </div>
      
      <div className={styles.forecastGrid}>
        {forecast.map((day, index) => (
          <div key={`${day.date}-${index}`} className={styles.forecastDay}>
            <div className={styles.date}>
              {formatDateShort(day.date)}
            </div>
            
            <div className={styles.temperatures}>
              <span className={styles.maxTemp}>
                {Math.round(day.temperature.max)}°
              </span>
              <span className={styles.minTemp}>
                {Math.round(day.temperature.min)}°
              </span>
            </div>
            
            <div className={styles.description}>
              {day.description}
            </div>
            
            <div className={styles.forecastDetails}>
              <div className={styles.detail}>
                <span className={styles.detailIcon}>💧</span>
                <span className={styles.detailValue}>{day.humidity}%</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailIcon}>💨</span>
                <span className={styles.detailValue}>{day.windSpeed}km/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}